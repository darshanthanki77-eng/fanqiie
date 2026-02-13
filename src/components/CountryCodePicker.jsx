import React, { useState } from 'react';
import { Check, Search } from 'lucide-react';
import './CountryCodePicker.css';

const COUNTRY_CODES = [
    { code: 'US', name: 'United States', dial: '+1' },
    { code: 'RU', name: 'Russia', dial: '+7' },
    { code: 'EG', name: 'Egypt', dial: '+20' },
    { code: 'ZA', name: 'South Africa', dial: '+27' },
    { code: 'GR', name: 'Greece', dial: '+30' },
    { code: 'NL', name: 'Netherlands', dial: '+31' },
    { code: 'BE', name: 'Belgium', dial: '+32' },
    { code: 'FR', name: 'France', dial: '+33' },
    { code: 'ES', name: 'Spain', dial: '+34' },
    { code: 'IN', name: 'India', dial: '+91' },
    { code: 'CN', name: 'China', dial: '+86' },
    { code: 'ID', name: 'Indonesia', dial: '+62' },
    { code: 'VN', name: 'Vietnam', dial: '+84' },
    { code: 'BR', name: 'Brazil', dial: '+55' },
    { code: 'MX', name: 'Mexico', dial: '+52' },
    { code: 'PH', name: 'Philippines', dial: '+63' },
    { code: 'TH', name: 'Thailand', dial: '+66' },
    { code: 'PK', name: 'Pakistan', dial: '+92' },
];

const CountryCodePicker = ({ isOpen, onClose, onSelect, selectedDial }) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredCountries = COUNTRY_CODES.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.dial.includes(searchTerm)
    );

    return (
        <div className="country-picker-overlay" onClick={onClose}>
            <div className="country-picker-modal" onClick={e => e.stopPropagation()}>
                <div style={{ position: 'relative' }}>
                    <Search className="search-icon" size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        className="country-search-box"
                        placeholder="Search country or code"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '38px' }}
                    />
                </div>

                <div className="country-list">
                    {filteredCountries.map((country) => (
                        <div
                            key={country.code}
                            className="country-item"
                            onClick={() => {
                                onSelect(country);
                                onClose();
                            }}
                        >
                            <span>{country.name} {country.dial}</span>
                            {selectedDial === country.dial && (
                                <Check size={16} className="selected-check" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CountryCodePicker;
