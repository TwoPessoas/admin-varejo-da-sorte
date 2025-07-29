// src/components/PageContentForm.tsx
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Check, XCircle } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useCallback } from "react";

// Esquema de validação Zod para os dados do Conteúdo de Página
const pageContentSchema = z.object({
  title: z.string().nonempty("O título é obrigatório."),
  slug: z.string().optional(),
  content: z.string().optional(),
});

type PageContentFormValues = z.infer<typeof pageContentSchema>;

interface PageContentFormProps {
  initialValues?: Partial<PageContentFormValues>;
  onSubmit: (data: PageContentFormValues) => Promise<void>;
  isLoading?: boolean;
}

// Componente da Toolbar do TipTap
interface TipTapToolbarProps {
  editor: any;
}

function TipTapToolbar({ editor }: TipTapToolbarProps) {
  const addImage = useCallback(() => {
    const url = window.prompt("URL da imagem:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL do link:", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 border-b-0 rounded-t-md p-2 bg-gray-50 flex flex-wrap gap-1">
      {/* Cabeçalhos */}
      <select
        onChange={(e) => {
          const level = parseInt(e.target.value);
          if (level === 0) {
            editor.chain().focus().setParagraph().run();
          } else {
            editor.chain().focus().toggleHeading({ level }).run();
          }
        }}
        className="px-2 py-1 text-sm border border-gray-300 rounded"
        value={
          editor.isActive("heading", { level: 1 })
            ? 1
            : editor.isActive("heading", { level: 2 })
            ? 2
            : editor.isActive("heading", { level: 3 })
            ? 3
            : 0
        }
      >
        <option value={0}>Parágrafo</option>
        <option value={1}>Título 1</option>
        <option value={2}>Título 2</option>
        <option value={3}>Título 3</option>
      </select>

      {/* Formatação de texto */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-1 text-sm border border-gray-300 rounded ${
          editor.isActive("bold") ? "bg-blue-200" : "bg-white"
        }`}
      >
        <strong>B</strong>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-1 text-sm border border-gray-300 rounded ${
          editor.isActive("italic") ? "bg-blue-200" : "bg-white"
        }`}
      >
        <em>I</em>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`px-3 py-1 text-sm border border-gray-300 rounded ${
          editor.isActive("underline") ? "bg-blue-200" : "bg-white"
        }`}
      >
        <u>U</u>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`px-3 py-1 text-sm border border-gray-300 rounded ${
          editor.isActive("strike") ? "bg-blue-200" : "bg-white"
        }`}
      >
        <s>S</s>
      </button>

      {/* Listas */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1 text-sm border border-gray-300 rounded ${
          editor.isActive("bulletList") ? "bg-blue-200" : "bg-white"
        }`}
      >
        • Lista
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1 text-sm border border-gray-300 rounded ${
          editor.isActive("orderedList") ? "bg-blue-200" : "bg-white"
        }`}
      >
        1. Lista
      </button>

      {/* Alinhamento */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`px-3 py-1 text-sm border border-gray-300 rounded ${
          editor.isActive({ textAlign: "left" }) ? "bg-blue-200" : "bg-white"
        }`}
      >
        ←
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`px-3 py-1 text-sm border border-gray-300 rounded ${
          editor.isActive({ textAlign: "center" }) ? "bg-blue-200" : "bg-white"
        }`}
      >
        ↔
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`px-3 py-1 text-sm border border-gray-300 rounded ${
          editor.isActive({ textAlign: "right" }) ? "bg-blue-200" : "bg-white"
        }`}
      >
        →
      </button>

      {/* Link */}
      <button
        type="button"
        onClick={setLink}
        className={`px-3 py-1 text-sm border border-gray-300 rounded ${
          editor.isActive("link") ? "bg-blue-200" : "bg-white"
        }`}
      >
        🔗 Link
      </button>

      {/* Imagem */}
      <button
        type="button"
        onClick={addImage}
        className="px-3 py-1 text-sm border border-gray-300 rounded bg-white"
      >
        🖼️ Imagem
      </button>

      {/* Citação */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`px-3 py-1 text-sm border border-gray-300 rounded ${
          editor.isActive("blockquote") ? "bg-blue-200" : "bg-white"
        }`}
      >
        " Citação
      </button>

      {/* Código */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-3 py-1 text-sm border border-gray-300 rounded ${
          editor.isActive("codeBlock") ? "bg-blue-200" : "bg-white"
        }`}
      >
        &lt;/&gt; Código
      </button>
    </div>
  );
}

// Componente do Editor TipTap
interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

function TipTapEditor({ content, onChange, placeholder }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4",
      },
    },
  });

  return (
    <div className="border border-gray-300 rounded-md">
      <TipTapToolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="border-t-0 rounded-b-md min-h-[200px]"
        placeholder={placeholder}
      />
    </div>
  );
}

export default function PageContentForm({
  initialValues = {},
  onSubmit,
  isLoading = false,
}: PageContentFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PageContentFormValues>({
    resolver: zodResolver(pageContentSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card">
      <div className="card-header">
        <h2 className="card-title">Dados do Conteúdo de Página</h2>
        <p className="card-subtitle">
          Preencha as informações para criar ou editar um conteúdo de página.
        </p>
      </div>

      <div className="card-body">
        {/* Agrupamento: Informações Básicas */}
        <fieldset className="border-t border-gray-200 pt-4 mb-6">
          <legend className="text-lg font-semibold text-gray-800 mb-4">
            Informações Básicas
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo: Título (Obrigatório) */}
            <div className="form-group md:col-span-2">
              <label htmlFor="title" className="form-label">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title")}
                type="text"
                id="title"
                className={`form-input ${errors.title ? "border-red-300" : ""}`}
                placeholder="Título principal do conteúdo de página"
              />
              {errors.title && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> {errors.title.message}
                </p>
              )}
            </div>

            {/* Campo: Slug (Opcional) */}
            <div className="form-group md:col-span-2">
              <label htmlFor="slug" className="form-label">
                Slug (URL amigável, opcional)
              </label>
              <input
                {...register("slug")}
                type="text"
                id="slug"
                className={`form-input ${errors.slug ? "border-red-300" : ""}`}
                placeholder="ex: minha-nova-pagina-de-conteudo"
              />
              {errors.slug && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> {errors.slug.message}
                </p>
              )}
              <p className="form-help">
                Se deixado em branco, será gerado automaticamente a partir do
                título.
              </p>
            </div>
          </div>
        </fieldset>

        {/* Agrupamento: Conteúdo da Página */}
        <fieldset className="border-t border-gray-200 pt-4 mb-6">
          <legend className="text-lg font-semibold text-gray-800 mb-4">
            Conteúdo da Página
          </legend>
          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Conteúdo (Editor de Texto Rico)
            </label>

            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TipTapEditor
                  content={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Insira o conteúdo da sua página aqui. Use as ferramentas acima para formatar o texto..."
                />
              )}
            />

            {errors.content && (
              <p className="form-error flex items-center mt-2">
                <XCircle className="w-4 h-4 mr-1" /> {errors.content.message}
              </p>
            )}
            <p className="form-help">
              Use as ferramentas do editor para formatar seu conteúdo. Você pode
              adicionar títulos, listas, links, imagens e muito mais.
            </p>
          </div>
        </fieldset>
      </div>

      {/* Botão de Enviar o Formulário */}
      <div className="card-footer">
        <button
          type="submit"
          className={`btn btn-primary w-full ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Check className="w-5 h-5 mr-2" />
          )}
          Salvar Conteúdo
        </button>
      </div>
    </form>
  );
}
