# AoT 2024 Solutions

My solutions for the [_Advent of TypeScript 2024_](https://www.adventofts.com/events/2024) hosted by [TypeHero](https://typehero.dev).

English | [简体中文](./README.zh-CN.md)

## Usage

Install dependencies:

```shell
npm install
```

All test cases of the challenges are migrated to the relevant test files in the `src` directory (`*.test.ts`). You can run the following command to test the solutions:

```shell
npm test
```

These test cases are originally written in [test-testing](https://github.com/MichiganTypeScript/type-testing) and migrated to [Typroof](https://github.com/Snowflyt/typroof).

<details>
  <summary>Click to Learn More About Typroof</summary>
  <p>Typroof is a type testing tool with a CLI interface and BDD-style assertions. Like <a href="https://github.com/mmkal/expect-type">expect-type</a>, it provides a WYSIWYG experience for compile-time tests. However, unlike expect-type, Typroof also allows testing behaviors that compile-time assertions can’t, such as checking if tuple labels are preserved or verifying JSDoc comments. It also offers a <a href="https://github.com/tsdjs/tsd">tsd</a>-like CLI interface that’s faster, more flexible, and lighter than tsd.</p>
</details>
