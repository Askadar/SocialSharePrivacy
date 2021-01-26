export interface IModule {
	private: boolean
	// status: true
	network: string

	graphics: {
		line?: string
		box?: string
		// dummy_line_img: 'images/dummy_buffer.png'
		// dummy_box_img: 'images/dummy_box_buffer.png'
	}

	i18n: {
		alt: string
		// dummy_alt: '"Buffer"-Dummy'
		info: string
		disabled: string
		enabled: string
		// txt_info: 'Two clicks for more privacy: The Buffer button will be enabled once you click here. Activating the button already sends data to Buffer &ndash; see <em>i</em>.'
		// txt_off: 'not connected to Buffer'
		// txt_on: 'connected to Buffer'
		display_name: string
		// display_name: 'Buffer'
	}
	loadI18N(strings: Record<string, string>): void

	getSwitchText(isPrivate: boolean): string

	meta: {
		// perma_option: true
		// referrer_track: ''
		// via: ''
	}

	getInfoText(): string
	getGraphic(): string
	getAlt(): string
	getIframeSrc(): string
	getIframeParams(): {
		[P in keyof HTMLIFrameElement]: HTMLIFrameElement[P]
	}
	// text: $.fn.socialSharePrivacy.getTitle
	// picture: $.fn.socialSharePrivacy.getImage
}

export class BaseModule implements IModule{

}
