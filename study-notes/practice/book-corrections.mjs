// Reviewed adjustments to the interactive adaptation. Original Markdown is unchanged.
const jls = n => `https://docs.oracle.com/javase/specs/jls/se21/html/jls-${n}.html`;
const api = name => `https://docs.oracle.com/en/java/javase/21/docs/api/java.base/${name}.html`;
const tool = name => `https://docs.oracle.com/en/java/javase/21/docs/specs/man/${name}.html`;
export const corrections = {
  'ch01:10': {
    reviewNote:'Select all methods belonging to either matching pair; the two pairs do not share one signature.',
    explanationMarkdown:'**A and B** both have the signature `update(int, String)`. **C and D** both have `update(String, int)`. Parameter names, access modifiers, return types, and throws clauses do not distinguish these signatures. E has a different second parameter type.',
    reference:jls(8)+'#jls-8.4.2'
  },
  'ch02:3': {
    optionChanges:{1:'`var` can declare initialized local variables and can also be used consistently for all parameters of a lambda expression.'},
    reviewNote:'Option B is clarified to include lambda parameters, supported in Java 21.',
    reference:jls(15)+'#jls-15.27.1'
  },
  'ch04:4': {
    answer:[0],
    reviewNote:'The book also marks B correct, but text blocks do not preserve all source whitespace exactly.',
    explanationMarkdown:'**A is correct.** Text blocks support embedded newlines. **B is false** because line endings are normalized, incidental indentation is removed, and trailing whitespace is processed. C is false: text blocks are not restricted to methods. D is too broad: meaningful leading spaces can remain. E is false: no minimum one-space indentation is required.',
    reference:jls(3)+'#jls-3.10.6'
  },
  'ch06:9': {
    reviewNote:'The answer key says A, but its explanation mistakenly calls A incorrect. The reviewed explanation below fixes that contradiction.',
    explanationMarkdown:'**A is correct:** the comparator sorts by age in ascending order, so the output is Bob (25), Alice (30), then Charlie (35). The other options use a different order.',
    reference:api('java/util/Comparator')
  },
  'ch06:7': {
    reviewNote:'Compare the map contents in the choices, not a guaranteed iteration order. HashMap does not promise the printed key order.',
    explanationMarkdown:'**D has the correct mappings:** 1 maps to A, 2 maps to D, and 3 maps to C. The second put for key 2 replaces B. HashMap forbids duplicate keys but does not guarantee the order in which those entries are printed.',
    reference:api('java/util/HashMap')
  },
  'ch07:4': {
    reviewNote:'Choose the best description of the code as written. Adding a catch is unnecessary, although a suitable catch could also compile.',
    reference:jls(14)+'#jls-14.20'
  },
  'ch07:5': {
    answer:[2],
    reviewNote:'The book marks C and D, but D is too broad: an unchecked exception can be caught even when the try body does not throw it explicitly.',
    explanationMarkdown:'**C is correct:** resources in a try-with-resources header are separated by semicolons. A is false because catch is optional. B confuses `throw` with `throws`. D is false as a general rule: catches for unchecked exceptions, and some broad exception types, are allowed without a matching checked throw in the try body.',
    reference:jls(11)+'#jls-11.2.3'
  },
  'ch08:5': {
    answer:[1,2],
    reviewNote:'Both B and C work with the shown Function<String, Integer> target. The book lists only C.',
    explanationMarkdown:'**B and C are valid.** `Integer.valueOf(String)` returns an Integer. `Integer.parseInt(String)` returns int, which is boxed to Integer for the target function. Both parse the decimal text here. The other references have the wrong owner, signature, or return type.',
    reference:api('java/lang/Integer')
  },
  'ch11:12': {
    reviewNote:'Treat the stated DST transition as a hypothetical rule. Running this example against an installed time-zone database can give a different result.',
    explanationMarkdown:'**C follows the question’s stated assumption.** If the clock jumps from midnight to 01:00, constructing midnight resolves the gap to 01:00 at -03:00. Adding one elapsed hour produces 02:00. This is reasoning under the supplied hypothetical rule, not a claim about the actual rules installed in every JDK.',
    reference:api('java/time/ZonedDateTime')
  },
  'ch11:13': {
    answer:[0,1],
    reviewNote:'A is also true: ZoneOffset extends ZoneId. The book lists only B.',
    explanationMarkdown:'**A and B are correct.** ZoneOffset is a ZoneId subtype, and ZonedDateTime can supply its Instant through `toInstant()`. A fixed ZoneOffset does not manage daylight-saving transitions. OffsetDateTime can use nonzero offsets; it is not restricted to UTC.',
    reference:api('java/time/ZoneOffset')
  },
  'ch11:14': {
    reviewNote:'Assume Locale.US, as the answer choices do. A localized formatter’s actual output depends on its locale.',
    reference:api('java/time/format/DateTimeFormatter')
  },
  'ch13:6': {
    answer:[0,2],
    reviewNote:'A and C are valid compilation approaches, assuming the shown sources need no extra dependencies. The book lists only C.',
    explanationMarkdown:'**A** explicitly compiles the descriptor and source files in single-module mode into `out`. **C** compiles the named module using the module-source hierarchy, usually producing `out/com.example`. Both compile the module; their output layouts differ. The other options misuse source locations or options.',
    reference:tool('javac')
  },
  'ch13:7': {
    answer:[0,1],
    reviewNote:'Both A and B can compile the shown modules. A assumes a shell supporting the shown find command substitution.',
    explanationMarkdown:'**A and B are correct.** A supplies source files explicitly while using the module-source path. B asks javac to compile the two named modules from that hierarchy. Both use `-d out`. C lacks the multi-module source-path configuration; D and E misuse options or source-path syntax.',
    reference:tool('javac')
  },
  'ch13:10': {
    answer:[0,1,2],
    reviewNote:'A is valid too: jdeps supports --list-deps. The book lists only B and C.',
    explanationMarkdown:'**A, B, and C are valid:** `--list-deps` reports module dependencies, `-verbose` reports class-level dependencies, and `-s` produces a summary. `--check` expects module names rather than a JAR path in that position.',
    reference:tool('jdeps')
  },
  'ch13:11': {
    extraOption:'`jmod create --class-path mods/com.example com.example.jmod`',
    answer:[4],
    reviewNote:'The four original choices use invalid jmod syntax. A valid fifth choice has been added to the interactive version.',
    explanationMarkdown:'**E is correct.** `create` is a jmod mode, `--class-path` supplies the class content, and the output JMOD filename is a positional argument. The tool has no `--output` option as used by the original choices, and `--create` is not the mode syntax.',
    reference:tool('jmod')
  },
  'ch13:13': {
    answer:[0,3],
    optionChanges:{3:'An automatic module can be created from a JAR without module-info.class placed on the module path, and it has broad readability of other resolved modules and unnamed modules.'},
    reviewNote:'A is also valid when the named modules are resolved. D is clarified to refer to the compiled module-info.class descriptor rather than module-info.java.',
    explanationMarkdown:'**A and D are correct.** An unnamed module reads resolved named modules and other unnamed modules. A non-modular JAR on the module path can become an automatic module, which has broad readability. Automatic modules do not require a module-info descriptor; unnamed modules cannot declare exports using one.',
    reference:jls(7)+'#jls-7.7.5'
  }
};
