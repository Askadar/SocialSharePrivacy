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
				<img class="privacy_dummy" src="{ graphics.line || graphics.box }">
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
			console.warn('Unexpected code reached handling switch click. Toggle state class was not found.')
		}
	}

	getShareButtonEl(): HTMLDivElement {
		const $container = this.getContainerEl()
		const $button = $container?.querySelector<HTMLDivElement>('.share-box__button')

		if (!$container || !$button) {
			throw new Error('Tried to access share button on unmnounted container')
		}

		return $button
	}
	createShareButtonEl(isPrivate: boolean): HTMLDivElement {}
	toggleShareButtonContents(toPublic: boolean): void {
		const $container = this.getContainerEl()
		const $button = this.getShareButtonEl()

		if (toPublic) {
			const $publicButton = this.createShareButtonEl(false)

			$container?.removeChild($button)
			$container?.appendChild($publicButton)
		} else {
			const $privateButton = this.createShareButtonEl(true)

			$container?.removeChild($button)
			$container?.appendChild($privateButton)
		}
	}

}
