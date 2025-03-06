import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    const decorationType = vscode.window.createTextEditorDecorationType({
        color: 'rgba(255, 255, 0, 0.4)',
        textDecoration: 'underline',
        cursor: 'pointer'
    });

    const openFileCommand = vscode.commands.registerCommand('extension.openFile', async (filePath: string, lineNumber: number = 1) => {
        try {
            filePath = path.normalize(filePath);

            if (!fs.existsSync(filePath)) {
                vscode.window.showErrorMessage(`File not found: ${filePath}`);
                return;
            }

            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
            const editor = await vscode.window.showTextDocument(doc);

            const position = new vscode.Position(Math.max(0, lineNumber - 1), 0);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
        } catch (err) {
            vscode.window.showErrorMessage(`Cannot open file: ${filePath}`);
            console.error(err);
        }
    });

    context.subscriptions.push(openFileCommand);

    const codeLensProvider = vscode.languages.registerCodeLensProvider(['javascript', 'typescript'], {
        provideCodeLenses(document) {
            const regex = /(?<=\/\/\s*goto\s*)([A-Za-z]:\\[^:]+\.(js|ts|jsx|tsx))(?::(\d+))?/g;
            const codeLenses: vscode.CodeLens[] = [];
            let match;

            while ((match = regex.exec(document.getText())) !== null) {
                const start = document.positionAt(match.index);
                const end = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(start, end);
                const filePath = match[1];
                const lineNumber = match[3] ? parseInt(match[3]) : 1;

                const command = {
                    title: '🔗 Fly To That File',
                    command: 'extension.openFile',
                    arguments: [filePath, lineNumber]
                };

                codeLenses.push(new vscode.CodeLens(range, command));
            }

            return codeLenses;
        }
    });

    context.subscriptions.push(codeLensProvider);

    function triggerUpdate(editor: vscode.TextEditor) {
        const regex = /(?<=\/\/\s*goto\s*)([A-Za-z]:\\[^:]+\.(js|ts|jsx|tsx))(?::(\d+))?/g;
        const text = editor.document.getText();
        const decorations: vscode.DecorationOptions[] = [];

        let match;
        while ((match = regex.exec(text)) !== null) {
            const start = editor.document.positionAt(match.index);
            const end = editor.document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(start, end);
            decorations.push({ range });
        }

        editor.setDecorations(decorationType, decorations);
    }

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            triggerUpdate(editor);
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            triggerUpdate(editor);
        }
    }, null, context.subscriptions);

    const editor = vscode.window.activeTextEditor;
    if (editor) {
        triggerUpdate(editor);
    }
}

export function deactivate() { }