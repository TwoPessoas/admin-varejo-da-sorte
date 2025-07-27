export default class ObjectUtils {
  // Remove propriedades com valor `undefined` ou `null`
  // para que a API não receba parâmetros vazios desnecessários.
  static removeParamsNuable(obj: { [key: string]: any }) {
    Object.keys(obj).forEach((key) => {
      if (obj[key] === undefined || obj[key] === null || obj[key] === "") {
        delete obj[key];
      }
    });
  }
}
