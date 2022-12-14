const viewerDefaults = [
    {
        action: 'screenIn',
        name: 'FadeIn',
        params: {
            delay: 0,
            duration: 1.2,
        },
    },
    {
        name: 'FadeOut',
        params: {
            delay: 0,
            duration: 1.2,
        },
    },
    {
        action: 'screenIn',
        name: 'FloatIn',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'right',
        },
    },
    {
        name: 'FloatOut',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'right',
        },
    },
    {
        action: 'screenIn',
        name: 'ExpandIn',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'right',
        },
    },
    {
        action: 'screenIn',
        name: 'SpinIn',
        params: {
            delay: 0,
            duration: 1.2,
            cycles: 2,
            direction: 'cw',
        },
    },
    {
        name: 'SpinOut',
        params: {
            delay: 0,
            duration: 1.2,
            cycles: 2,
            direction: 'cw',
        },
    },
    {
        action: 'screenIn',
        name: 'FlyIn',
        params: {
            delay: 0.4,
            duration: 1.2,
            direction: 'right',
        },
    },
    {
        name: 'FlyOut',
        params: {
            delay: 0.4,
            duration: 1.2,
            direction: 'right',
        },
    },
    {
        action: 'screenIn',
        name: 'TurnIn',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'right',
        },
    },
    {
        name: 'TurnOut',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'right',
        },
    },
    {
        action: 'screenIn',
        name: 'ArcIn',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'right',
        },
    },
    {
        name: 'ArcOut',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'right',
        },
    },
    {
        name: 'Conceal',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'right',
        },
    },
    {
        name: 'CollapseOut',
        params: {
            delay: 0,
            duration: 1.2,
        },
    },
    {
        name: 'PopOut',
        params: {
            delay: 0,
            duration: 1.2,
        },
    },
    {
        action: 'screenIn',
        name: 'DropIn',
        params: {
            delay: 0,
            duration: 1.2,
        },
    },
    {
        action: 'screenIn',
        name: 'FlipIn',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'left',
        },
    },
    {
        name: 'FlipOut',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'left',
        },
    },
    {
        action: 'screenIn',
        name: 'FoldIn',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'left',
        },
    },
    {
        name: 'FoldOut',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'left',
        },
    },
    {
        action: 'screenIn',
        name: 'Reveal',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'left',
        },
    },
    {
        action: 'screenIn',
        name: 'SlideIn',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'left',
        },
    },
    {
        name: 'SlideOut',
        params: {
            delay: 0,
            duration: 3,
            direction: 'left',
        },
    },
    {
        action: 'screenIn',
        name: 'BounceIn',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'top left',
            bounce: 'medium',
        },
    },
    {
        action: 'screenIn',
        name: 'GlideIn',
        params: {
            delay: 0,
            duration: 1.2,
            angle: 0,
            distance: 150,
        },
    },
    {
        name: 'BounceOut',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'top left',
            bounce: 'medium',
        },
    },
    {
        name: 'GlideOut',
        params: {
            delay: 0,
            duration: 1.2,
            angle: 0,
            distance: 150,
        },
    },
    {
        action: 'modeChange',
        name: 'ModesMotion',
        params: {
            delay: 0,
            duration: 0.5,
        },
    },
    {
        action: 'modeIn',
        name: 'FadeIn',
        params: {
            delay: 0,
            duration: 1.2,
        },
    },
    {
        action: 'modeIn',
        name: 'FloatIn',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'right',
        },
    },
    {
        action: 'modeIn',
        name: 'ExpandIn',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'right',
        },
    },
    {
        action: 'modeIn',
        name: 'SpinIn',
        params: {
            delay: 0,
            duration: 1.2,
            cycles: 2,
            direction: 'cw',
        },
    },
    {
        action: 'modeIn',
        name: 'FlyIn',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'right',
        },
    },
    {
        action: 'modeIn',
        name: 'TurnIn',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'right',
        },
    },
    {
        action: 'modeIn',
        name: 'ArcIn',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'right',
        },
    },
    {
        action: 'modeIn',
        name: 'DropIn',
        params: {
            delay: 0,
            duration: 1.2,
        },
    },
    {
        action: 'modeIn',
        name: 'FlipIn',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'left',
        },
    },
    {
        action: 'modeIn',
        name: 'FoldIn',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'left',
        },
    },
    {
        action: 'modeIn',
        name: 'Reveal',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'left',
        },
    },
    {
        action: 'modeIn',
        name: 'SlideIn',
        params: {
            delay: 0,
            duration: 1.2,
            direction: 'left',
        },
    },
];
export { viewerDefaults };
//# sourceMappingURL=viewerDefaults.js.map