package meta

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/mangaweb4/mangaweb4-backend/configuration"
	"github.com/mangaweb4/mangaweb4-backend/container"
	"github.com/mangaweb4/mangaweb4-backend/ent"
	"github.com/mangaweb4/mangaweb4-backend/ent/meta"
	tag_util "github.com/mangaweb4/mangaweb4-backend/tag"
	"github.com/mangaweb4/mangaweb4-backend/vips"
	"github.com/rs/zerolog/log"

	"golang.org/x/exp/slices"
	_ "golang.org/x/image/webp"
)

const (
	META_THUMB_LOCATION        = "meta"
	THUMBNAIL_FILENAME_PATTERN = "%d.jpg"

	THUMBNAIL_HEIGHT = 510
)

func NewItem(ctx context.Context, client *ent.Client, name string, ct meta.ContainerType) (i *ent.Meta, err error) {
	createTime := time.Now()

	c := configuration.Get()
	if stat, e := fs.Stat(os.DirFS(c.DataPath), name); e == nil {
		createTime = stat.ModTime()
	}

	i = &ent.Meta{
		Name:          name,
		CreateTime:    createTime,
		Favorite:      false,
		ContainerType: ct,
	}

	if err = GenerateImageIndices(i); err != nil {
		return
	}

	return client.Meta.Create().
		SetName(i.Name).
		SetCreateTime(i.CreateTime).
		SetFileIndices(i.FileIndices).
		SetContainerType(ct).
		Save(ctx)
}

func Open(m *ent.Meta) (reader io.ReadCloser, err error) {
	mutex := new(sync.Mutex)
	mutex.Lock()
	defer mutex.Unlock()

	c := configuration.Get()

	fullpath := filepath.Join(c.DataPath, m.Name)

	reader, err = os.Open(fullpath)
	return
}

type CropDetails struct {
	X      int `json:"x"`
	Y      int `json:"y"`
	Width  int `json:"width"`
	Height int `json:"height"`
}

func CreateThumbnail(m *ent.Meta) (thumbnail *vips.Image, err error) {
	mutex := new(sync.Mutex)
	mutex.Lock()
	defer mutex.Unlock()

	c, err := container.CreateContainer(m)
	if err != nil {
		return
	}

	stream, _, err := c.OpenItem(context.Background(), m.ThumbnailIndex)
	if err != nil {
		return
	}

	defer func() { log.Err(stream.Close()).Msg("close thumbnail stream.") }()

	imgSrc := vips.NewSource(stream)

	options := vips.DefaultLoadOptions()
	// options.Autorotate = true

	img, err := vips.NewImageFromSource(imgSrc, options)
	if err != nil {
		err = fmt.Errorf("unable to load image: %w", err)
		return
	}

	if m.ThumbnailWidth > 0 && m.ThumbnailHeight > 0 {
		img.ExtractArea(m.ThumbnailX, m.ThumbnailY, m.ThumbnailWidth, m.ThumbnailHeight)
	}

	if img.Height() > THUMBNAIL_HEIGHT {
		thumbnailOptions := vips.DefaultThumbnailImageOptions()
		thumbnailOptions.Height = THUMBNAIL_HEIGHT

		img.ThumbnailImage(1000000, thumbnailOptions)
	}

	thumbnail = img
	return
}

func CreateThumbnailPath(id int) string {
	c := configuration.Get()
	return filepath.Join(c.CachePath, META_THUMB_LOCATION, fmt.Sprintf(THUMBNAIL_FILENAME_PATTERN, id))
}

func GetThumbnailBytes(m *ent.Meta) (thumbnail []byte, err error) {
	thumbfile := CreateThumbnailPath(m.ID)
	file, err := os.Open(thumbfile)
	buffer := bytes.Buffer{}

	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			err = os.MkdirAll(filepath.Dir(thumbfile), fs.ModePerm)
			if err != nil {
				return
			}
			img, e := CreateThumbnail(m)
			if e != nil {
				err = e
				return
			}
			defer img.Close()

			{
				options := vips.DefaultJpegsaveOptions()
				options.Q = 75
				err = img.Jpegsave(thumbfile, options)
				if err != nil {
					return
				}
			}

			{
				var wc io.WriteCloser = struct {
					io.Writer
					io.Closer
				}{
					Writer: &buffer,
					Closer: io.NopCloser(nil), // Uses a nil-safe no-op closer
				}

				target := vips.NewTarget(wc)
				options := vips.DefaultJpegsaveTargetOptions()
				options.Q = 75
				err = img.JpegsaveTarget(target, options)
				if err != nil {
					err = fmt.Errorf("unable to populate image: %w", err)
					return
				}
			}
		} else {
			return
		}
	} else {
		_, err = io.Copy(&buffer, file)
		if err != nil {
			return
		}
	}

	thumbnail = bytes.Clone(buffer.Bytes())

	return
}

func DeleteThumbnail(m *ent.Meta) error {
	thumbfile := CreateThumbnailPath(m.ID)
	err := os.Remove(thumbfile)

	if errors.Is(err, os.ErrNotExist) {
		return nil
	}

	return err
}

func GenerateImageIndices(m *ent.Meta) error {
	mutex := new(sync.Mutex)
	mutex.Lock()
	defer mutex.Unlock()

	c, err := container.CreateContainer(m)
	if err != nil {
		return err
	}

	return c.PopulateImageIndices(context.Background())
}

func PopulateTags(ctx context.Context, client *ent.Client, m *ent.Meta) (out *ent.Meta, tags []*ent.Tag, err error) {
	log.Debug().Msg("PopulateTags")
	tagStrs := tag_util.ParseTag(m.Name)

	log.Debug().Strs("tagStrs", tagStrs).Msg("ParseTag")
	currentTags, _ := m.QueryTags().All(ctx)

	log.Debug().Any("currentTags", currentTags).Msg("current tags")

	newTags := make([]*ent.Tag, 0)
	for _, t := range tagStrs {
		if slices.ContainsFunc(currentTags, func(tag *ent.Tag) bool {
			return tag.Name == t
		}) {
			continue
		}

		var tag *ent.Tag
		if temp, err := tag_util.Read(ctx, client, t); err != nil {
			tag = &ent.Tag{
				Name: t,
			}

			tag, _ = client.Tag.Create().
				SetName(tag.Name).
				SetHidden(tag.Hidden).
				Save(ctx)

		} else {
			tag = temp
		}
		newTags = append(newTags, tag)
	}

	m, _ = m.Update().
		AddTags(newTags...).
		Save(ctx)

	for _, t := range newTags {
		if m.CreateTime.After(t.LastUpdate) {
			_, err = t.Update().SetLastUpdate(m.CreateTime).Save(ctx)
			if err != nil {
				return
			}
		}
	}

	out = m
	tags = append(currentTags, newTags...)

	return
}
