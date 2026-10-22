import { TiptapExperiment } from './tiptap-experiment';

export default function Page() {
  return (
    <main>
      <p className="eyebrow">Etapa 2 · comparação acionada</p>
      <h1>Editor Tiptap</h1>
      <p>Mesma bancada de teclado e 5.000 blocos usada no experimento Lexical.</p>
      <TiptapExperiment />
    </main>
  );
}
