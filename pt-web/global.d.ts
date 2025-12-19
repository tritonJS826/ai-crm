declare module "*.module.scss" {
    const classes: { [key: string]: string };
    // eslint-disable-next-line no-restricted-exports
    export default classes;
  }

declare module "*.scss";
declare module "*.css";
