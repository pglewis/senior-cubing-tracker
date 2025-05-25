import {useSearchParams} from 'react-router-dom';

export function useKinchParams() {
	const [searchParams, setSearchParams] = useSearchParams();

	return {
		page: Number(searchParams.get('page')) || 1,
		age: searchParams.get('age') || '40',
		region: searchParams.get('region') || 'world',
		wcaId: searchParams.get('wcaid') || '',
		setParams: (params: Partial<{
			page: number;
			age: string;
			region: string;
			wcaId: string;
		}>) => {
			const newParams = new URLSearchParams(searchParams);
			Object.entries(params).forEach(([key, value]) => {
				if (value) {
					newParams.set(key, String(value));
				} else {
					newParams.delete(key);
				}
			});
			setSearchParams(newParams);
		}
	};
}