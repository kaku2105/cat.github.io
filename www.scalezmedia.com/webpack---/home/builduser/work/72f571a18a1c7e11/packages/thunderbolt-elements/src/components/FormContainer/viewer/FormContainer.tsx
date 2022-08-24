import * as React from 'react';
import classnames from 'classnames';
import { IFormContainerProps } from '../FormContainer.types';
import MeshContainer from '../../../thunderbolt-core-components/MeshContainer/viewer/MeshContainer';
import { FormContainerRoot } from './shared/FormContainerRoot';
import styles from './styles/FormContainer.scss';

const FormContainerSkin: React.FC<IFormContainerProps> = props => {
  const {
    id,
    meshProps,
    onSubmit,
    children,
    onMouseEnter,
    onMouseLeave,
    inlineBorder,
  } = props;

  const meshContainerProps = {
    id,
    ...meshProps,
    children,
  };

  return (
    <FormContainerRoot
      id={id}
      className={inlineBorder ? '' : styles.root}
      onSubmit={onSubmit}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {inlineBorder && (
        <div className={classnames(styles.root, styles.border)} />
      )}
      <MeshContainer {...meshContainerProps} />
    </FormContainerRoot>
  );
};

export default FormContainerSkin;
