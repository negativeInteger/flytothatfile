import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

let extensionContext: vscode.ExtensionContext;
// Decoration Type for Highlighting the matched text
const decorationType = vscode.window.createTextEditorDecorationType({
    color: 'rgba(234, 216, 53, 0.63)',
    textDecoration: 'underline',
    cursor: 'pointer'
});

export function activate(context: vscode.ExtensionContext) {
    // setting extensionContext for deactivate() function
    extensionContext = context;
    
    // Matches: 
    // 'flyto C:\path\file.js:30'  
    // 'flyto C:\path\file.js'    
    // 'flyto C:\path\file.ts:30'
    // 'flyto C:\path\file.ts'
    const regex = /(?<=\/\/\s*flyto\s*)([A-Za-z]:\\[^:]+\.(js|ts|jsx|tsx))(?::(\d+))?/g;

    // openFileCommand opens the file 
    const openFileCommand = vscode.commands.registerCommand('extension.openFile', async (filePath: string, lineNumber: number = 1) => {
        try {
            // Normalize path according to OS
            filePath = path.normalize(filePath);
            if (!fs.existsSync(filePath)) {
                vscode.window.showErrorMessage(`File not found: ${filePath}`);
                return;
            }
            // Open file in a new tab
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
            const editor = await vscode.window.showTextDocument(doc);
            // Move cursor to the specified line
            const position = new vscode.Position(Math.max(0, lineNumber - 1), 0);
            editor.selection = new vscode.Selection(position, position);
            // Centers the view on the target line.
            editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
        } catch (err) {
            vscode.window.showErrorMessage(`Cannot open file: ${filePath}`);
            console.error(err);
        };
    });
    // Register the command
    context.subscriptions.push(openFileCommand);
    // Show ✈️ as a clickable icon
    const codeLensProvider = vscode.languages.registerCodeLensProvider(['javascript', 'typescript'], {
        provideCodeLenses(document) {
            const codeLenses: vscode.CodeLens[] = [];
            let match;
            while ((match = regex.exec(document.getText())) !== null) {
                const start = document.positionAt(match.index);
                const end = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(start, end);
                const filePath = match[1];
                const lineNumber = match[3] ? parseInt(match[3]) : 1;
                const command = {
                    title: `✈️`,
                    command: 'extension.openFile',
                    arguments: [filePath, lineNumber]
                };
                codeLenses.push(new vscode.CodeLens(range, command));
            };
            return codeLenses;
        }
    });

    context.subscriptions.push(codeLensProvider);
    // Adding text decorations 
    function triggerUpdate(editor: vscode.TextEditor) {
        // Read whole text
        const text = editor.document.getText();
        const decorations: vscode.DecorationOptions[] = [];
        let match;
        // Highlight matches
        while ((match = regex.exec(text)) !== null) {
            const start = editor.document.positionAt(match.index);
            const end = editor.document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(start, end);
            decorations.push({ range });
        };
        editor.setDecorations(decorationType, decorations);
    };
    // Update decorations when switching editors
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            triggerUpdate(editor);
        };
    }, null, context.subscriptions);
    // Update decorations when switching tabs
    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            triggerUpdate(editor);
        };
    }, null, context.subscriptions);
    // Initial trigger when extension starts
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        triggerUpdate(editor);
    };
};

export function deactivate() {
    console.log('flyto Cleaning up...');
    decorationType.dispose();
    if(extensionContext) {
        extensionContext.subscriptions.forEach(sub =>  sub.dispose());
    };
};
