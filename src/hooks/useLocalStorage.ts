import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(key: string, defaultValue: T) => {
	const [value, setValue] = useState<T | null>(null);

	useEffect(() => {
		try {
			const item = localStorage.getItem(key);
			if (!item) {
				localStorage.setItem(key, JSON.stringify(defaultValue));
				setValue(defaultValue);
			} else {
				const parsedValue = JSON.parse(item) as T;
				setValue(parsedValue);
			}
		} catch (e) {
			console.error(e);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const setItem = (value: T) => {
		try {
			setValue(value);
			localStorage.setItem(key, JSON.stringify(value));
		} catch (e) {
			console.error(e);
		}
	};

	return { value, setItem };
};
