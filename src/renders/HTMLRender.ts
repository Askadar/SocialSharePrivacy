/**
 * @description Basic HTML-based View (render) that wraps generic Module and outputs it's state and binds events
 * Can be replaced with later-created library-specific renders, like jQuery or Vue
 *
 * Sample view:
 *
 * Off:
		<li class="help_info share-box { network } -- share-box">
			<div class="info">{info text}</div>
			<span class="switch {value} -- share-box__switch switch switch--{value}">{ enabled status text }</span>
			<div class="dummy_btn { network } -- share-box__button share-box__button--dummy{? !enabled}">
				<img class="privacy_dummy -- share-box__network-preview" src="{ graphics.line || graphics.box }">
			</div>
		</li>
 * On:
		<li class="help_info { network } info_{ enabled } -- share-box share-box--{ network }">
			<div class="info -- share-box__info">{info text}</div>
			<span class="switch switch_{value} -- share-box__switch switch switch--{value}">{ enabled status text }</span>
			<div class="dummy_btn { network } -- share-box__button share-box__button--dummy{? !enabled}">
				<iframe allowtransparency="true" scrolling="no" src="{ constructed src }" frameborder="0" { ...iframeParams } />
			</div>
		</li>
 * Note regarding sample view:
		- `{ name }` is a variable hint;
		- `class="help_info -- share-box"` contains both old and new BEM class markup separated by `--`
			meant to denote planned class and design update based on extra customization and easier design adaptation
 */

import { IModule } from '../modules/_BaseModule'

export class HTMLRender {
	private readonly _root: HTMLElement
	private readonly _module: IModule

	constructor(parent: HTMLElement, module: IModule) {
		this._root = parent
		this._module = module
	}

	renderButNotExactlyMaybeChangeNameOrLogic(): HTMLElement {
		const $existingContainer = this.getContainerEl()
		if ($existingContainer) {
			return $existingContainer
		}

		const $container = this.createContainerEl()

		this._root.appendChild($container)
		return $existingContainer || $container
	}

	private getEl<HTMLElementType extends HTMLElement>(
		selector: string,
		_name: string
	): HTMLElementType {
		const $container = this.getContainerEl()
		const $element = $container?.querySelector<HTMLElementType>(selector)

		if (!$container || !$element) {
			throw new Error(`Tried to access ${_name} on unmnounted container`)
		}

		return $element
	}

	getContainerEl() {
		return this._root.querySelector<HTMLLIElement>(`.share-box--{this._module.network}`)
	}
	createContainerEl() {
		const $box = document.createElement('li')

		const $infobox = this.createInfoboxEl()
		$box.appendChild($infobox)

		const $switch = this.createSwitchEl()
		$box.appendChild($switch)

		const $button = this.createShareButtonEl()
		$box.appendChild($button)

		return $box
	}

	createInfoboxEl() {}

	createSwitchEl() {}
	handleSwitchClick(event: MouseEvent): void {
		const $switch = event.currentTarget as HTMLSpanElement

		if ($switch.classList.contains('switch--off')) {
			const forPublic = true

			$switch.classList.add('switch--on')
			$switch.classList.remove('switch--off')

			$switch.innerText = this._module.getSwitchText(!forPublic) || '\u00a0'
			this.toggleShareButtonContents(forPublic)
		} else if ($switch.classList.contains('switch--on')) {
			const forPrivate = true

			$switch.classList.add('switch--on')
			$switch.classList.remove('switch--off')

			$switch.innerText = this._module.getSwitchText(forPrivate) || '\u00a0'
			this.toggleShareButtonContents(!forPrivate)
		} else {
			console.warn(
				'Unexpected code reached handling switch click. Toggle state class was not found.'
			)
		}
	}

	getShareButtonEl = this.getEl.bind(this, 'share-box__button', 'share button')
	createShareButtonEl(isPrivate: boolean): HTMLDivElement {
		const $button = document.createElement('div')

		if (isPrivate) {
			const $img = document.createElement('img')

			$img.src = this._module.getGraphic()
			$img.alt = this._module.getAlt()
			$img.className = 'share-box__network-preview'

			$button.appendChild($img)
		} else {
			// <iframe src="{ constructed src }" frameborder="0" { ...iframeParams } />
			const $iframe = document.createElement('iframe')
			const extraParams = this._module.getIframeParams()

			// IE <= 9 support
			// $iframe.allowtransparency="true"

			$iframe.src = this._module.getIframeSrc()
			if (extraParams) {
				const entries = Object.entries(extraParams)
				entries
					.filter(([key]) => Object.getOwnPropertyDescriptor($iframe, key)?.writable)
					// TODO decide on final extraParams interface so we don't need to iterate over all potential iframe properties
					// @ts-ignore: Currently allowed, ignore should be removed after interface is decided
					.forEach(([key, value]) => (key in $iframe ? ($iframe[key] = value) : null))
			}
		}

		return $button
	}
	toggleShareButtonContents(toPublic: boolean): void {
		const $container = this.getContainerEl()
		const $button = this.getShareButtonEl()

		if (toPublic) {
			const $publicButton = this.createShareButtonEl(!toPublic)

			$container?.removeChild($button)
			$container?.appendChild($publicButton)
		} else {
			const $privateButton = this.createShareButtonEl(toPublic)

			$container?.removeChild($button)
			$container?.appendChild($privateButton)
		}
	}
}
