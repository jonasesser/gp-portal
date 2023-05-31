import * as AthenaClient from '@AthenaClient/api';
import ViewModel from '../../../client/models/viewModel';

const PAGE_NAME = 'GPPortal_Space';

export class PortalSpaceView implements ViewModel {
    static init() {}

    static async createView(): Promise<void> {
        AthenaClient.webview.openPages([PAGE_NAME]);
        AthenaClient.webview.focus();
        AthenaClient.webview.unfocus();
    }

    static async closeView(): Promise<void> {
        AthenaClient.webview.closePages([PAGE_NAME]);
    }
}
