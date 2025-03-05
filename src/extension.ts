import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
        textDecoration: 'underline',
        cursor: 'pointer'
    });

    // Comprehensive command to open file
    const openFileCommand = vscode.commands.registerCommand('extension.openFile', async (fileInfo: string) => {
        try {
            // Split the file path and line number
            const parts = fileInfo.split(':');
            const filePath = parts[0].trim();
            const lineNumber = parts.length > 1 ? parseInt(parts[1].trim()) : 1;

            // Verify file exists
            if (!fs.existsSync(filePath)) {
                vscode.window.showErrorMessage(`File not found: ${filePath}`);
                return;
            }

            // Open the document
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
            const editor = await vscode.window.showTextDocument(doc);

            // Move cursor to specified line (adjusting for 0-based indexing)
            const line = Math.max(0, lineNumber - 1);
            const position = new vscode.Position(line, 0);
            
            // Set selection and reveal
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
        } catch (err) {
            vscode.window.showErrorMessage(`Cannot open file: ${fileInfo}`);
            console.error(err);
        }
    });

    context.subscriptions.push(openFileCommand);

    // Hover provider with improved path detection
    const hoverProvider = vscode.languages.registerHoverProvider(['javascript', 'typescript'], {
        provideHover(document, position) {
            // More flexible regex to catch full file paths
            const regex = /(?<=\/\/\s*goto\s*)([A-Za-z]:\\[^:]+\.(js|ts|jsx|tsx))(?::(\d+))?/;
            const wordRange = document.getWordRangeAtPosition(position, regex);
            
            if (wordRange) {
                const fullText = document.getText(wordRange);
                const match = fullText.match(regex);
                
                if (match) {
                    const filePath = match[1];
                    const lineNumber = match[3] || '1';
                    
                    // Encode the full path with line number
                    const encodedPath = encodeURIComponent(`${filePath}:${lineNumber}`);
                    const commandUri = vscode.Uri.parse(`command:extension.openFile?${encodedPath}`);
                    
                    const markdown = new vscode.MarkdownString(`[Open File](${commandUri})`);
                    markdown.isTrusted = true;
                    
                    return new vscode.Hover(markdown, wordRange);
                }
            }
            return undefined;
        }
    });

    context.subscriptions.push(hoverProvider);

    // Update decorations function
    function triggerUpdate(editor: vscode.TextEditor) {
        // Regex to match goto comments with full paths
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

    // Event listeners for updating decorations
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

    // Initial update for current editor
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        triggerUpdate(editor);
    }
}

export function deactivate() {}