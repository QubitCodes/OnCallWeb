'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * HeaderActionContext
 * Allows child pages to inject custom action buttons into the shared Header/topbar.
 * Pages call setHeaderActions() with their JSX, and the Header renders it.
 */
interface HeaderActionContextType {
	headerActions: ReactNode | null;
	setHeaderActions: (actions: ReactNode | null) => void;
	previewLink: string;
	setPreviewLink: (url: string) => void;
}

const HeaderActionContext = createContext<HeaderActionContextType>({
	headerActions: null,
	setHeaderActions: () => {},
	previewLink: '/',
	setPreviewLink: () => {},
});

export function HeaderActionProvider({ children }: { children: ReactNode }) {
	const [headerActions, setHeaderActions] = useState<ReactNode | null>(null);
	const [previewLink, setPreviewLink] = useState<string>('/');

	return (
		<HeaderActionContext.Provider value={{ headerActions, setHeaderActions, previewLink, setPreviewLink }}>
			{children}
		</HeaderActionContext.Provider>
	);
}

export function useHeaderActions(actions: ReactNode, customPreviewLink?: string) {
	const { setHeaderActions, setPreviewLink } = useContext(HeaderActionContext);

	useEffect(() => {
		setHeaderActions(actions);
		if (customPreviewLink) setPreviewLink(customPreviewLink);
		return () => {
			setHeaderActions(null);
			if (customPreviewLink) setPreviewLink('/');
		};
	}, [actions, customPreviewLink, setHeaderActions, setPreviewLink]);
}

/** Used by the Header component to read the current actions */
export function useHeaderActionSlot() {
	return useContext(HeaderActionContext);
}
