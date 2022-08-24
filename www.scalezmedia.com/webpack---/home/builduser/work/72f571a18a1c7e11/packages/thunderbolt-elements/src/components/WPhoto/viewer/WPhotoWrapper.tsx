import * as React from 'react';
import classNames from 'classnames';
import {
  IElementPropsSDKActions,
  IClickPropsSDKActions,
} from '../../../core/corvid/props-factories';
import { replaceCompIdPlaceholder } from '../../../core/commons/vectorImageUtils';
import styles from './WPhotoWrapper.scss';

type WPhotoWrapperProps = {
  id: string;
  className: string;
  title?: string;
  withOnClickHandler: boolean;
  filterEffectSvgString?: string;
  filterEffectSvgUrl?: string;
} & Partial<IElementPropsSDKActions> &
  Partial<IClickPropsSDKActions>;

export const WPhotoWrapper: React.FC<WPhotoWrapperProps> = props => {
  const {
    id,
    children,
    className,
    title,
    onClick,
    onDblClick,
    withOnClickHandler,
    onMouseEnter,
    onMouseLeave,
    filterEffectSvgString,
    filterEffectSvgUrl,
  } = props;
  const withOnClickHandlerClass = withOnClickHandler
    ? styles.withOnClickHandler
    : '';

  const inlineStyle = filterEffectSvgUrl
    ? {
        style: {
          '--filter-effect-svg-url': filterEffectSvgUrl,
        } as React.CSSProperties,
      }
    : {};

  const filterEffectSvg = filterEffectSvgString ? (
    <svg id={`svg_${id}`} className={styles.filterEffectSvg}>
      <defs
        dangerouslySetInnerHTML={{
          __html: replaceCompIdPlaceholder(filterEffectSvgString, id),
        }}
      />
    </svg>
  ) : null;

  return (
    <div
      id={id}
      className={classNames(className, withOnClickHandlerClass)}
      title={title}
      onClick={onClick}
      onDoubleClick={onDblClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...inlineStyle}
    >
      {filterEffectSvg}
      {children}
    </div>
  );
};
