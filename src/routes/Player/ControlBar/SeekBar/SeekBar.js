// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const ReactDOM = require('react-dom');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const debounce = require('lodash.debounce');
const { useTranslation } = require('react-i18next');
const { default: useRouteFocused } = require('stremio/common/useRouteFocused');
const { getInterfaceScale } = require('stremio/common/interfaceScale');
const { Slider } = require('stremio/components');
const formatTime = require('./formatTime');
const styles = require('./styles');

const formatLiveDelay = (delay) => `−${formatTime(Math.max(0, delay)).replace(/^00:/, '').replace(/^0(?=\d:)/, '')}`;

const SeekBar = ({ className, time, duration, buffered, onSeekRequested, onPlayRequested, playbackSpeed, live, liveTiming, seekable, paused, buffering }) => {
    const { t } = useTranslation();
    const minimum = live && seekable ? liveTiming.start : 0;
    const maximum = live ? seekable ? liveTiming.end : 100 : duration;
    const disabled = !seekable || !Number.isFinite(time) || !Number.isFinite(maximum) || maximum <= minimum;
    const routeFocused = useRouteFocused();
    const sliderRef = React.useRef(null);
    const [seekTime, setSeekTime] = React.useState(null);
    const [hover, setHover] = React.useState(null);
    const displayedTime = seekTime !== null ? seekTime : time;
    const behindLive = live && seekable && Number.isFinite(displayedTime) && maximum - displayedTime > liveTiming.tolerance;
    const currentTime = live && !behindLive ? maximum : displayedTime;

    const resetTimeDebounced = React.useCallback(debounce(() => {
        setSeekTime(null);
    }, 1500), []);
    const onSlide = React.useCallback((time) => {
        resetTimeDebounced.cancel();
        setHover(null);
        setSeekTime(time);
    }, []);
    const onMouseMove = React.useCallback((event) => {
        if (disabled || sliderRef.current === null) {
            return;
        }

        const { x, y, width } = sliderRef.current.getBoundingClientRect();
        const position = Math.min(Math.max((event.clientX - x) / width, 0), 1);
        const scale = getInterfaceScale();
        setHover({ time: minimum + position * (maximum - minimum), x: (x + position * width) / scale, y: y / scale });
    }, [disabled, minimum, maximum]);
    const onMouseLeave = React.useCallback(() => {
        setHover(null);
    }, []);
    const onComplete = React.useCallback((time) => {
        resetTimeDebounced();
        setSeekTime(time);
        if (typeof onSeekRequested === 'function') {
            onSeekRequested(time);
        }
    }, [onSeekRequested]);

    React.useLayoutEffect(() => {
        if (!routeFocused || disabled) {
            resetTimeDebounced.cancel();
            setSeekTime(null);
            setHover(null);
        }
    }, [routeFocused, disabled]);
    React.useEffect(() => {
        return () => {
            resetTimeDebounced.cancel();
        };
    }, []);

    return (
        <div className={classnames(className, styles['seek-bar-container'], { 'active': seekTime !== null })}>
            <div ref={sliderRef} className={styles['slider-wrapper']} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
                <Slider
                    className={classnames(styles['slider'], { 'active': seekTime !== null, [styles['live-slider']]: live })}
                    value={
                        !disabled ?
                            currentTime
                            :
                            live ?
                                maximum
                                :
                                0
                    }
                    buffered={
                        live ?
                            null
                            :
                            buffered
                    }
                    minimumValue={minimum}
                    maximumValue={maximum}
                    disabled={disabled}
                    onSlide={onSlide}
                    onComplete={onComplete}
                />
                {
                    hover !== null && seekTime === null && !disabled ?
                        ReactDOM.createPortal(
                            <div className={styles['seek-tooltip']} style={{ left: `${hover.x}px`, top: `${hover.y}px` }}>
                                {live ? maximum - hover.time <= liveTiming.tolerance ? t('PLAYER_LIVE') : formatLiveDelay(maximum - hover.time) : formatTime(hover.time)}
                            </div>,
                            document.body
                        )
                        :
                        null
                }
            </div>
        </div>
    );
};

SeekBar.propTypes = {
    className: PropTypes.string,
    time: PropTypes.number,
    duration: PropTypes.number,
    buffered: PropTypes.number,
    onSeekRequested: PropTypes.func,
    onPlayRequested: PropTypes.func,
    playbackSpeed: PropTypes.number,
    live: PropTypes.bool,
    liveTiming: PropTypes.shape({ start: PropTypes.number, end: PropTypes.number, tolerance: PropTypes.number }),
    seekable: PropTypes.bool,
    paused: PropTypes.bool,
    buffering: PropTypes.bool
};

module.exports = SeekBar;
