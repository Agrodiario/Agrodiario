export interface ProdutoFormuladoResponseDto {
  numero_registro: string;
  marca_comercial: string[];
  titular_registro: string;
  produto_biologico: boolean;
  classe_categoria_agronomica: string[];
  formulacao: string;
  ingrediente_ativo: string[];
  ingrediente_ativo_detalhado: {
    ingrediente_ativo: string;
    grupo_quimico: string;
    concentracao: string;
    unidade_medida: string;
    percentual: string;
  }[];
  modo_acao: string[];
  tecnica_aplicacao: string[];
  indicacao_uso: {
    cultura: string;
    praga_nome_cientifico: string;
    praga_nome_comum: string[] | string;
  }[];
  classificacao_toxicologica: string;
  classificacao_ambiental: string;
  inflamavel: boolean;
  corrosivo: boolean;
  documento_cadastrado: {
    descricao: string;
    tipo_documento: string;
    data_inclusao: string;
    url: string;
    origem: string;
  }[];
  produto_agricultura_organica: boolean;
  url_agrofit: string;
}
