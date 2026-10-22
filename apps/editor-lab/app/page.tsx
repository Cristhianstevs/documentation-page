import { EditorExperiment } from './editor-experiment';

export default function Page() {
  return (
    <main>
      <p className="eyebrow">Etapa 2 · experimento isolado</p>
      <h1>Editor Lexical</h1>
      <p>
        Esta bancada mede teclado e documentos grandes. Ela não salva arquivos e não faz parte do
        leitor público.
      </p>
      <EditorExperiment />
    </main>
  );
}
