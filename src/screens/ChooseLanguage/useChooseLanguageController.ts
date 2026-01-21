import { useState, useCallback } from 'react';
import { goBack } from '../../utils/navigation';

const LANGUAGES = [
    { label: 'English', value: 'en' },
    { label: 'Arabic', value: 'ar' },
    { label: 'French', value: 'fr' },
    { label: 'Spanish', value: 'es' },
];

const useChooseLanguageController = () => {
    const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].value);
    const [isOpen, setIsOpen] = useState(false);

    const onApply = useCallback(() => {
        // Logic to apply language change would go here
        goBack();
    }, []);

    const toggleDropdown = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const selectLanguage = useCallback((value: string) => {
        setSelectedLanguage(value);
        setIsOpen(false);
    }, []);

    const selectedLabel = LANGUAGES.find(l => l.value === selectedLanguage)?.label || '';

    return {
        values: {
            languages: LANGUAGES,
            selectedLanguage,
            selectedLabel,
            isOpen,
        },
        functions: {
            setSelectedLanguage: selectLanguage,
            onApply,
            toggleDropdown,
        }
    };
};

export default useChooseLanguageController;
