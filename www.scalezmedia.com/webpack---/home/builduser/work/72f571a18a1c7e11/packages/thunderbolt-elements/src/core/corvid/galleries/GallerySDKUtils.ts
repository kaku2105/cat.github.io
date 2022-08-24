import { LinkUtils } from '@wix/thunderbolt-symbols';
import type { LinkProps } from '@wix/editor-elements-types/corvid';
import {
  messages,
  reportError,
  reportWarning,
  createMediaSrc,
  parseMediaSrc,
} from '@wix/editor-elements-corvid-utils';
import { ImageProps } from '@wix/thunderbolt-components-native';
import {
  GalleryItemProps,
  ItemProps,
  ItemUserModel,
  TPAItemProps,
} from './GalleriesSDK.types';

type LINK_TYPE = 'WEBSITE' | 'DYNAMIC_PAGE_LINK';

const isUndefined = (x: any): boolean => typeof x === 'undefined';

const pickBy = (
  obj: { [key: string]: any },
  predicate: (value: any, key: string) => boolean,
): { [key: string]: any } =>
  Object.entries(obj).reduce<{ [key: string]: any }>((acc, [k, v]) => {
    if (predicate(v, k)) {
      acc[k] = v;
    }
    return acc;
  }, {});

export const convertImagesToUserModel = (
  images: Array<ItemProps>,
  linkUtils: LinkUtils,
): Array<ItemUserModel> => {
  return images.map((image: ItemProps) => {
    const { type, title, width, height, uri, alt, description, link } = image;
    const mediaSrc = createMediaSrc({
      mediaId: uri,
      type: type.toLowerCase(),
      title,
      width,
      height,
    });

    const optionalValues = pickBy(
      {
        description,
        alt,
        title,
        height,
        width,
        ...(link && { link: linkUtils.getLink(link), target: link.target }),
      },
      value => !isUndefined(value),
    );
    return {
      type: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
      src: mediaSrc.item || mediaSrc.error || '',
      ...optionalValues,
    };
  });
};

export const convertGalleryItemsToUserModel = (
  items: Array<GalleryItemProps>,
  linkUtils: LinkUtils,
): Array<ItemUserModel> => {
  const images = items.map(item => {
    return {
      id: item.dataId,
      type: 'Image',
      title: item.title,
      width: item.image.width,
      height: item.image.height,
      uri: item.image.uri,
      alt: item.image.alt,
      description: item.description,
      link: item.link,
    };
  });

  return convertImagesToUserModel(images, linkUtils);
};

const getIdGenerator = (compId: string, dataId: string) => (index: number) =>
  `${compId}_runtime_${dataId}items${index}`;

const convertImageOrReportError = (
  src: string | undefined,
  index: number,
  title: string | undefined,
  description: string | undefined,
  alt: string | undefined,
  imageLinkProps: ImageLinkProps | null,
  idGenerator: (index: number) => string,
): ItemProps | null => {
  src = src || '';
  const { height, width, error, mediaId = '' } = parseMediaSrc(src, 'image');
  if (error) {
    reportError(
      messages.invalidImageInGalleryWithIndex({
        wrongValue: src,
        index,
        propertyName: 'src',
      }),
    );
  }
  const uri = mediaId as string;

  return {
    id: idGenerator(index),
    type: 'image',
    height,
    width,
    uri,
    ...(title && { title }),
    ...(description && { description }),
    ...(alt && { alt }),
    ...(imageLinkProps && { ...imageLinkProps }),
  };
};

type ImageLinkProps = {
  link: LinkProps;
  linkType?: LINK_TYPE;
  href?: string;
};
type ResolveLink = (
  link: string,
  target?: LinkProps['target'],
) => ImageLinkProps;

const _convertToImagesPropsOrReport = (
  items: Array<ItemUserModel>,
  role: string,
  compId: string,
  dataId: string,
  resolveLink: ResolveLink,
): Array<ItemProps> | null => {
  const images = items.filter(
    image => !image.type || image.type.toLowerCase() === 'image',
  );
  if (images.length !== items.length) {
    reportWarning(messages.noneImageInGallery(role));
  }
  const imagesModel = images
    .map(
      (
        image: {
          src?: string;
          title?: string;
          description?: string;
          alt?: string;
          link?: string;
          target?: LinkProps['target'];
        },
        index: number,
      ) => {
        const { title, description, alt, link, src, target } = image;
        const linkTarget = target ? target : '_self';
        const imageLinkProps = link ? resolveLink(link, linkTarget) : null;

        return convertImageOrReportError(
          src,
          index,
          title,
          description,
          alt,
          imageLinkProps,
          getIdGenerator(compId, dataId),
        );
      },
    )
    .filter(x => x !== null) as Array<ItemProps>;

  return imagesModel;
};

export const convertToGalleryItemsPropsOrReport = (
  items: Array<ItemUserModel>,
  role: string,
  compId: string,
  dataId: string,
  linkUtils: LinkUtils,
  displayMode: ImageProps['displayMode'],
): Array<GalleryItemProps> | null => {
  const resolveLink = (link: string, target?: LinkProps['target']) => ({
    link: linkUtils.getLinkProps(link, target),
  });
  const images = _convertToImagesPropsOrReport(
    items,
    role,
    compId,
    dataId,
    resolveLink,
  );

  if (!images) {
    return null;
  }

  return images.map(image => {
    const imageProps = {
      displayMode,
      uri: image.uri,
      width: image.width,
      height: image.height,
      alt: image.alt,
      title: image.title,
    } as ImageProps;

    return {
      dataId: image.id,
      title: image.title,
      description: image.description,
      image: imageProps,
      link: image.link,
    };
  });
};

export const convertToTPAImagesPropsOrReport = (
  items: Array<ItemUserModel>,
  role: string,
  compId: string,
  dataId: string,
  linkUtils: LinkUtils,
): Array<TPAItemProps> | null => {
  const resolveLink = (link: string, target?: LinkProps['target']) => {
    const linkProps = linkUtils.getLinkProps(link, target);
    const linkType = (
      linkUtils.isDynamicPage(link) ? 'DYNAMIC_PAGE_LINK' : 'WEBSITE'
    ) as LINK_TYPE;

    return {
      link: linkProps,
      href: linkProps.href,
      linkType,
    };
  };
  return _convertToImagesPropsOrReport(
    items,
    role,
    compId,
    dataId,
    resolveLink,
  );
};

export const createUnsupportedAPIReporter = (galleryType: string) => {
  return (api: string) =>
    reportWarning(
      `'${api}' is not supported for an element of type: ${galleryType}.`,
    );
};
