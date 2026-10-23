// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { useTranslation } = require('react-i18next');
const NavTabButton = require('./NavTabButton');
const styles = require('./styles');

const VerticalNavBar = React.memo(React.forwardRef(({ className, selected, tabs }, ref) => {
    const { t } = useTranslation();
    return (
        <nav ref={ref} className={classnames(className, styles['vertical-nav-bar-container'])}>
            <div className={styles['brand-logo-container']} title={'Hayase'}>
                <svg className={styles['brand-logo']} viewBox="0 0 66.145833 66.145833" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#ffffff" d="M.00000117 61.5156237V4.6302097l66.145831 37.041664v19.84375l-47.624995-26.72291v16.40416zm66.145831-30.42707-23.547916-13.229174 23.547916-13.22917Z"/>
                </svg>
            </div>
            <div className={styles['nav-tabs-group']}>
                {
                    Array.isArray(tabs) ?
                        tabs.filter((tab) => tab.id !== 'settings').map((tab, index) => (
                            <NavTabButton
                                key={index}
                                className={styles['nav-tab-button']}
                                selected={tab.id === selected}
                                href={tab.href}
                                logo={tab.logo}
                                icon={tab.icon}
                                label={t(tab.label)}
                                onClick={tab.onClick}
                            />
                        ))
                        :
                        null
                }
            </div>
            <div className={styles['nav-bottom-group']}>
                {
                    Array.isArray(tabs) ?
                        tabs.filter((tab) => tab.id === 'settings').map((tab, index) => (
                            <NavTabButton
                                key={index}
                                className={styles['nav-tab-button']}
                                selected={tab.id === selected}
                                href={tab.href}
                                logo={tab.logo}
                                icon={tab.icon}
                                label={t(tab.label)}
                                onClick={tab.onClick}
                            />
                        ))
                        :
                        null
                }
            </div>
        </nav>
    );
}));

VerticalNavBar.displayName = 'VerticalNavBar';

VerticalNavBar.propTypes = {
    className: PropTypes.string,
    selected: PropTypes.string,
    tabs: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        label: PropTypes.string,
        logo: PropTypes.string,
        icon: PropTypes.string,
        href: PropTypes.string,
        onClick: PropTypes.func
    }))
};

module.exports = VerticalNavBar;
