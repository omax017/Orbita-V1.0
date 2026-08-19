// ESLint só resolve "extends" por nome de pacote seguindo a convenção
// eslint-config-*/@scope/eslint-config* — como @hubwin/config não segue essa
// convenção (o pacote também guarda tsconfig.base.json, não é só um preset
// ESLint), referenciamos o arquivo por caminho relativo em vez do nome do pacote.
module.exports = {
  extends: ["../../packages/config/eslint-preset.cjs"],
  parserOptions: {
    project: "./tsconfig.json",
  },
};
