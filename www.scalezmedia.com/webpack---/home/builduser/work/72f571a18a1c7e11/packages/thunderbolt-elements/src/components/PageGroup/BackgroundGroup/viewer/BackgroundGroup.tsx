import React, { ReactNode } from 'react';
import { IBackgroundGroupProps } from '../BackgroundGroup.types';
import GroupContent from '../../commons/viewer/GroupContent';
import { TRANSITION_GROUP_ID } from '../../commons/constants';

const GroupContentMemo = React.memo(GroupContent, (__, nextProps) => {
  return (
    !(nextProps.children()! as Array<ReactNode>).length ||
    nextProps.transitionEnabled === false
  );
});

const BackgroundGroup: React.FC<IBackgroundGroupProps> = props => {
  const { id, children, ...restProps } = props;
  return (
    <div id={id}>
      <GroupContentMemo id={`${id}_${TRANSITION_GROUP_ID}`} {...restProps}>
        {children}
      </GroupContentMemo>
    </div>
  );
};

export default BackgroundGroup;
