# Parser Combinators: The Final Frontier

_This is a modified version of the original problem with simpler and more ergonomic types. The original problem uses `Parse` for 2 different purposes: to define parsers and to apply them. This version uses `Parse` only to apply parsers, and parsers are defined simply by using the parser types directly. See [original problem](./24.question.md) for the original problem description._

> _[🎅Santa]_ First the elves needed a code parser, then we had that JSON situation... I'm starting to see a pattern here.
>
> _[🎩Bernard]_ We keep building one-off parsers for everything! Maybe we should create a reusable parsing system?
>
> _[🎅Santa]_ Like some sort of parser factory? That's brilliant! We could use it for everything - toy specs, route planning... uh... everything!
>
> _[🎩Bernard]_ Right... I'll get started on the design.

The elves need your help building a type-safe parser combinator system! Instead of creating individual parsers for each format, you'll create building blocks that can be combined to parse anything.

Here's how the elves want to use it:

```typescript
// define simple parsers
type DigitParser = Just<Digit>;

// combine into more complex parsers
type IntParser = MapResult<Parse<Many1, DigitParser>, [Join, StringToNumber]>;

// parse!
type Parsed = Parse<IntParser, "123.4ff">["data"]; // 123
```

Implement all of these core parser combinators:

- `MaybeResult` - A result type for parsers that may fail
- `Mapper` - A mapper is a type-level function that transforms the parsed data
- `Parser` - A parser is a type-level function that attempts to parse an input string

- `Parse` - The core parser type

- `EOF` - Matches the end of input
- `Choice<Parsers extends Parser[]>` - Tries each parser in order until one succeeds, and returns the result of the first successful parser
- `Just<Token extends string>` - Matches exactly one character/token
- `Many0<P extends Parser>` - Matches zero or more of the parser, and returns a tuple of the results
- `Many1<P extends Parser>` - Matches one or more of the parser, and returns a tuple of the results
- `MapResult<P extends Parser, Mappers extends Mapper[]>` - Matches the parser and maps the parsed data through the provided mappers
- `Maybe<P extends Parser>` - Matches a parser zero or one times, and returns the result of the parser as `MaybeResult`
- `NoneOf<Token extends string>` - Matches none of the characters/tokens
- `Pair<L extends Parser, R extends Parser>` - Matches two parsers in sequence, and returns the results in a 2-element tuple
- `Seq<Parsers extends Parser[]>` - Matches multiple parsers in sequence, and returns the results in a tuple
- `Left<L extends Parser, R extends Parser>` - Matches both parsers in sequence and returns the result of the left parser
- `Right<L extends Parser, R extends Parser>` - Matches both parsers in sequence and returns the result of the right parser
- `SepBy0<P extends Parser, Sep extends Parser>` - Matches zero or more of the parser separated by the separator parser, and returns a tuple of the results (separators are discarded)

Each parser should return a result type containing:

- `success`: Whether the parse succeeded
- `data`: The parsed data
- `rest`: The remaining unparsed input

<details>
  <summary>Hint</summary>

Your solution from Day 23 might be helpful here. Start with the simplest parsers and build up to more complex ones. Make use of anything that has already been implemented for you.

</details>
