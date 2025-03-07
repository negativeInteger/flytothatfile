import * as vscode from 'vscode';
import * as path from 'path';
import * as assert from 'assert';
import { activate, deactivate } from '../extension';

describe('Flyto Extension', () => {
    let context: vscode.ExtensionContext;

    before(() => {
        context = { subscriptions: [] } as unknown as vscode.ExtensionContext;
        activate(context);
    });

    after(() => {
        deactivate();
    });

    it('should normalize file paths correctly', async () => {
        const input = 'C:/folder/file.js';
        const normalized = path.normalize(input);
        assert.strictEqual(normalized, 'C:\\folder\\file.js');
    });

    it('should register openFileCommand', () => {
        const commands = context.subscriptions.map(sub => (sub as vscode.Disposable).dispose);
        assert.strictEqual(commands.length > 0, true);
    });

    it('should dispose subscriptions on deactivate', () => {
        deactivate();
        assert.strictEqual(context.subscriptions.length, 0);
    });
});
