/**
 * @description Basic HTML-based SSP View (render) that's called by SSP app and provides way to attach to or render into
 *
 * Sample view:
 *
		<div class="social-share-privacy-container">
			{ <modules... /> }
		</div>
 */

import { IModule } from '../modules/_BaseModule'
import { HTMLModuleRender } from './HTMLModuleRender'

class HTMLRender {
	private readonly _root: HTMLDivElement
	private readonly _modules: IModule[]
	private readonly networks: HTMLModuleRender[]

	constructor(root: HTMLDivElement, modules: IModule[]) {
		this._root = root
		this._modules = modules

		this.networks = modules.map((module) => new HTMLModuleRender(root, module))
		this.networks.forEach(network => network.renderButNotExactlyMaybeChangeNameOrLogic())
	}

	public unmount(): void {
		this.networks.forEach(network => network.unmount())
	}

}

export const setup = (modules: IModule[], rootOrParent?: HTMLElement): HTMLRender => {
	if (!rootOrParent) {
		throw new Error(`HTMLRender requires root or parent element`)
	}

	if (rootOrParent.classList.contains('social-share-privacy-container')) {
		if (rootOrParent.tagName !== 'DIV') {
			console.warn(`SSP container should be DIV element. Unexpected behaviour can occur`)
		}

		const root = rootOrParent as HTMLDivElement
		return new HTMLRender(root, modules)
	}

	const $container = document.createElement('div')

	$container.classList.add('social-share-privacy-container')

	rootOrParent.appendChild($container)
	return new HTMLRender($container, modules)
}
