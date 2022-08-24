import * as React from 'react';
import {
  ISkinableContainerProps,
  IContainerImperativeActions,
} from '../../Container.types';
import { ContainerLogic } from './ContainerLogic';
import { TestIds } from './constants';

/** This is a shared dom structure for similar skins */
const BasicContainerComp: React.ForwardRefRenderFunction<
  IContainerImperativeActions,
  ISkinableContainerProps
> = ({ classes, ...rest }, ref) => {
  return (
    <ContainerLogic
      {...rest}
      ref={ref}
      className={classes.root}
      renderSlot={({ containerChildren }) => (
        <>
          <div className={classes.bg} data-testid={TestIds.BG} />
          {containerChildren}
        </>
      )}
    />
  );
};

export const BasicContainer = React.forwardRef(BasicContainerComp);
