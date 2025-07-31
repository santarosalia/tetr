export const isMobile = (): boolean => {
    // 터치 지원 여부 확인
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // 화면 크기 확인 (모바일 기준)
    const isSmallScreen = window.innerWidth <= 768;

    // User Agent 확인
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

    return hasTouch && (isSmallScreen || isMobileUA);
};

export const isPortrait = (): boolean => {
    return window.innerHeight > window.innerWidth;
};

export const getScreenSize = (): 'small' | 'medium' | 'large' => {
    const width = window.innerWidth;
    if (width <= 480) return 'small';
    if (width <= 768) return 'medium';
    return 'large';
};
