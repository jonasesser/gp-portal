import * as alt from 'alt-client';
import { WebViewController } from '../../client/extensions/view2';
import ViewModel from '../../client/models/viewModel';
import { SYSTEM_EVENTS } from '../../shared/enums/system';

const PAGE_NAME = 'GPPortal_Space';

export class PortalSpaceView implements ViewModel {
    static init() {}

    static async createView(): Promise<void> {
        WebViewController.openPages([PAGE_NAME]);
        WebViewController.focus();
        WebViewController.unfocus();
    }

    static async closeView(): Promise<void> {
        WebViewController.closePages([PAGE_NAME]);
    }
}
