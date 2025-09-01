export default {
  extends: ["stylelint-config-standard"],
  rules: {
    "selector-class-pattern": null,
    "keyframes-name-pattern": null,
    "selector-pseudo-class-no-unknown": [true, {
      ignorePseudoClasses: ["global"],
    }],
  },
};