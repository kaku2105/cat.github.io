import * as React from 'react';
import classNames from 'classnames';
import FillLayers from '../../FillLayers/viewer/FillLayers';
import { StripColumnsContainerProps } from '../StripColumnsContainer.types';
import { TestIds } from '../constants';
import { MediaContainerVideoAPI } from '../../MediaContainers/MediaContainer/MediaContainer.types';
import { useVideoAPI } from '../../../core/useVideoAPI';
import { getDataAttributes } from '../../../core/commons/utils';
import styles from './style/StripColumnsContainer.scss';

type DividerLayerStyle = React.HTMLAttributes<HTMLDivElement> & {
  '--divider-layer-i': number;
};

function generateLayers(hasDivider: boolean, layersSize?: number) {
  return hasDivider
    ? [...Array(1 + (layersSize || 0)).keys()]
        .reverse()
        .map(i => (
          <div
            style={{ '--divider-layer-i': i } as DividerLayerStyle}
            className={styles.dividerLayer}
            data-testid={`divider-layer-${i}`}
          />
        ))
    : null;
}

function generateDivider(
  side: 'top' | 'bottom',
  content?: boolean | string,
  size?: number,
) {
  const hasDivider = content === true;
  const dividerLayers = generateLayers(hasDivider, size);

  return content ? (
    <div
      className={classNames(styles.shapeDivider, {
        [styles.topShapeDivider]: side === 'top',
        [styles.bottomShapeDivider]: side === 'bottom',
      })}
      data-testid={`${side}-divider`}
      {...(typeof content === 'string'
        ? { dangerouslySetInnerHTML: { __html: content } }
        : {})}
    >
      {dividerLayers}
    </div>
  ) : null;
}

const StripColumnsContainer: React.ForwardRefRenderFunction<
  MediaContainerVideoAPI,
  StripColumnsContainerProps
> = (props, compRef) => {
  const {
    id,
    className,
    fillLayers,
    children,
    onMouseEnter,
    onMouseLeave,
    onClick,
    onDblClick,
    getPlaceholder,
    a11y = {},
    onStop,
    dividers,
  }: StripColumnsContainerProps = props;
  const sdkEventHandlers = {
    onMouseEnter,
    onMouseLeave,
    onClick,
    onDoubleClick: onDblClick,
  };

  // fix content in front of background in position:fixed disappearing when scrolling to it - Chromium +85 bug
  const shouldFixContentFlashing = fillLayers.hasBgFullscreenScrollEffect;

  const hasVideo = !!fillLayers.video;
  const videoRef = useVideoAPI(compRef, hasVideo, onStop);

  const topDivider = React.useMemo(() => {
    return generateDivider(
      'top',
      dividers?.topContent,
      dividers?.topLayers?.size,
    );
  }, [dividers?.topContent, dividers?.topLayers?.size]);

  const bottomDivider = React.useMemo(() => {
    return generateDivider(
      'bottom',
      dividers?.bottomContent,
      dividers?.bottomLayers?.size,
    );
  }, [dividers?.bottomContent, dividers?.bottomLayers?.size]);

  return (
    <section
      id={id}
      {...getDataAttributes(props)}
      {...sdkEventHandlers}
      {...a11y}
      className={classNames(className, styles.stripColumnsContainer)}
    >
      <FillLayers
        {...fillLayers}
        getPlaceholder={getPlaceholder}
        videoRef={videoRef}
      />
      {topDivider}
      {bottomDivider}
      <div
        data-testid={TestIds.columns}
        className={classNames(styles.columns, {
          [styles.fixFlashingContent]: shouldFixContentFlashing,
        })}
      >
        {children()}
      </div>
    </section>
  );
};

export default React.forwardRef(StripColumnsContainer);
