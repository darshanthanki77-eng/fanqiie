import React from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import './SwitchLanguage.css';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'italiano' },
    { code: 'jp', name: '日本語' },
    { code: 'kr', name: '한국인' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ru', name: 'Русский' },
    { code: 'vn', name: 'Tiếng Việt' },
    { code: 'pt', name: 'Português' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'es', name: 'español' },
    { code: 'fa', name: 'فارسی' }, // Persian
    { code: 'ar', name: 'عربي' }, // Arabic
    { code: 'id', name: 'bahasa Indonesia' },
    { code: 'el', name: 'Ελληνικά' },
    { code: 'ms', name: 'Melayu' },
    { code: 'th', name: 'แบบไทย' },
    { code: 'la', name: 'Latinus' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ur', name: 'اردو' },
    { code: 'cn', name: '繁体中文' },
];

const SwitchLanguage = ({ currentLang, onSelectLang, onBack }) => {
    return (
        <div className="lang-container">
            <div className="lang-header">
                <div className="lang-back" onClick={onBack}>
                    <ChevronLeft size={24} color="#fff" />
                </div>
                <div className="lang-title">Switch Language</div>
            </div>

            <div className="lang-list">
                {languages.map((lang) => (
                    <div
                        key={lang.code}
                        className="lang-item"
                        onClick={() => {
                            onSelectLang(lang.code);
                            onBack(); // Go back after selection
                        }}
                    >
                        <span className="lang-name">{lang.name}</span>
                        {currentLang === lang.code && (
                            <div className="lang-check">
                                <Check size={14} color="white" strokeWidth={3} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SwitchLanguage;
