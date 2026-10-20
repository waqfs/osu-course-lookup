## osu-course-lookup
A CLI tool for browsing The Ohio State University courses. Functioning as an alternative to [osucoursesearch.org](https://osucoursesearch.org/) by Hanson Ma.

#### Inspiration
It is often the question of "which professor is the best" for any and every CSE course, because there is a such a huge variation with professor quality and course difficulty. OSU acknowledges this problem by ignoring it, and hiding the professors for CSE courses. So, I built my own tool to query current and historical semester data and attempt to predict which professors will be teaching.

### Usage
This project uses [Bun](https://bun.sh), so install `bun` if you do not have it yet. Then, clone the repository, `cd` into the repo, and install dependencies:
```zsh
bun i
```

Then, you can search courses for/from any semester with predictions computed against any other semester with the following:
```zsh
bun run src/index.ts --term TTTT --predict PPPP
```

To find the values required for `TTTT` and `PPPP`, the algorithm can be found [here](https://www.asc.ohio-state.edu/barrett.3/schedule/SUBJECT/term.txt), copied:
```
first three digits = calendar year-1900
4th digit = 0/winter (quarters only), 2/spring, 4/summer, 8/autumn
so Autumn 2012 is 2012-1900 = 112 & 8 --> 1128.
```

The [package.json](package.json) contains shorthand scripts for the current semester and some previous ones. To run for Spring '27, execute:
```zsh
bun run sp27
```

#### Example Output
Running `bun run src/index.ts --term 1272 --predict 1268` (`bun run sp27`):
```
0005#6274 status:OPEN[1/40+0] LE IN_PERSON DL0357=TR 8:00-8:55A <predict:Paolo Bucci>
0006#6275 status:OPEN[1/40+0] LA IN_PERSON DL0280=WF 8:00-8:55A <predict:Paolo Bucci>
0010#6212 status:OPEN[1/40+0] LE IN_PERSON DL0357=TR 9:10-10:05A <predict:KT Vandergriff>
0011#6213 status:OPEN[1/40+0] LA IN_PERSON DL0280=WF 9:10-10:05A <predict:KT Vandergriff>
0020#6214 status:OPEN[1/40+0] LE IN_PERSON DL0357=TR 10:20-11:15A <predict:KT Vandergriff>
```

On lab/lecture classes, there will be a line for each part of the section. Each line can be summarized as:
```
SECTION#ID status:OPEN/CLOSED[enrolled/max+waitlist] TYPE LOCATION=DAYS TIME <professor/predict:professor>
```

For registration, the `#ID` is the important value.

> [!CAUTION]
> Because this tool uses APIs and not the official portal, there is no guarantee that the courses listed are accurate and/or complete. There is no guarantee that a predicted professor is going to be the professor teaching that section once the semester starts.


### License
This project is dedicated to the public domain.

> [!NOTE]
> This repository and its contents are not affiliated with The Ohio State University. All APIs used are public and unauthenticated.