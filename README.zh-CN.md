# AoT 2024 Solutions

我个人对由 [TypeHero](https://typehero.dev) 主办的 [_Advent of TypeScript 2024_](https://www.adventofts.com/events/2024) 年度挑战的解答。

[English](./README.md) | 简体中文

## 使用

安装依赖：

```shell
npm install
```

所有题目的测试用例已迁移到 `src` 目录下的相关测试文件（`*.test.ts`）。你可以通过以下命令运行这些测试：

```shell
npm test
```

<details>
  <summary>点击了解更多关于 Typroof 的信息</summary>
  <p>Typroof 是一个类型测试工具，提供 CLI 接口和 BDD 风格的断言。与 <a href="https://github.com/mmkal/expect-type">expect-type</a> 类似，它为编译时测试提供了所见即所得的体验。但不同于 expect-type 的是，Typroof 还提供了编译时断言无法提供的能力，比如检查元组标签是否被保留，或验证 JSDoc 注释是否正确。它还提供了一个类似 <a href="https://github.com/tsdjs/tsd">tsd</a> 的 CLI 接口，但比 tsd 更快、更灵活、更轻量。</p>
</details>
