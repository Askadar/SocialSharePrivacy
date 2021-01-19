import ssp from './'

;(() => {
	function docReady(fn: () => void) {
		// see if DOM is already available
		if (
			document.readyState === 'complete' ||
			document.readyState === 'interactive'
		) {
			// call on next available tick
			setTimeout(fn, 1)
		} else {
			document.addEventListener('DOMContentLoaded', fn)
		}
	}

	docReady(() => {
		const targets = Array.from(
			document.querySelectorAll(
				'[data-social-share-privacy=true]:not([data-init=true])'
			)
		).filter((element): element is HTMLElement => element instanceof HTMLElement)

		targets.forEach(ssp)
		targets.forEach((el) => el.dataset.init = 'true')
	})
})()
