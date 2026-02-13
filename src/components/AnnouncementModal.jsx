import React from 'react';
import { X } from 'lucide-react';
import './AnnouncementModal.css';
import rocketImage from '../assets/popupimg.png';

const ANNOUNCEMENTS = {
    en: {
        title: "Announcement",
        p1: "FanQie TV's latest revenue platform",
        linkRef: "Official registration link:",
        tgService: "Telegram customer service:",
        channelLink: "Official channel link:",
        detailsIntro: "Package prices and revenue details are as follows:",
        p1star: "1-star package: price 8USDT, daily income 2USDT.",
        p2star: "2-star package: price 30USDT, daily income 7.5USDT.",
        p3star: "3-star package: price 101USDT, daily income 26.00USDT",
        btn: "I Know"
    },
    cn: {
        title: "公告",
        p1: "番茄影视最新收益平台",
        linkRef: "官方注册链接:",
        tgService: "Telegram 客服:",
        channelLink: "官方频道链接:",
        detailsIntro: "套餐价格及收益详情如下:",
        p1star: "1星套餐: 价格 8USDT, 日收益 2USDT.",
        p2star: "2星套餐: 价格 30USDT, 日收益 7.5USDT.",
        p3star: "3星套餐: 价格 101USDT, 日收益 26.00USDT",
        btn: "我知道了"
    }
};

const AnnouncementModal = ({ onClose, lang }) => {
    const content = ANNOUNCEMENTS[lang] || ANNOUNCEMENTS['en'];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                {/* Header Graphic */}
                <div className="modal-graphic-header">
                    <div className="graphic-glow"></div>
                    <img
                        src={rocketImage}
                        alt="Rocket Launch"
                        className="rocket-full-img"
                    />
                </div>

                <div className="modal-body-premium">
                    <h3 className="modal-title-premium">{content.title}</h3>
                    <div className="modal-text-premium">
                        <div className="announcement-card-item">
                            <p className="announcement-subtitle">{content.p1}</p>
                        </div>

                        <div className="announcement-section">
                            <p className="announcement-label">{content.linkRef}</p>
                            <span className="highlight-link-premium">https://fanqie-tv.net/#/reg?ref=820178</span>
                        </div>

                        <div className="announcement-section">
                            <p className="announcement-label">{content.tgService}</p>
                            <span className="highlight-link-premium">https://t.me/fanqietv789</span>
                        </div>

                        <div className="announcement-section">
                            <p className="announcement-label">{content.channelLink}</p>
                            <span className="highlight-link-premium">https://t.me/+K1WdD84OyExkODc0</span>
                        </div>

                        <div className="announcement-details-box">
                            <p className="details-intro-text">{content.detailsIntro}</p>
                            <div className="price-row">
                                <div className="dot-icon"></div>
                                <p>{content.p1star}</p>
                            </div>
                            <div className="price-row">
                                <div className="dot-icon"></div>
                                <p>{content.p2star}</p>
                            </div>
                            <div className="price-row">
                                <div className="dot-icon"></div>
                                <p>{content.p3star}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer-premium">
                    <button className="modal-confirm-btn" onClick={onClose}>{content.btn}</button>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementModal;
