/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex

%%
\s+                   /* skip whitespace */
[0-9]+("."[0-9]+)?\b  return 'NUMBER';
[a-zA-Z]+             return 'IDENTIFIER';
"*"                   return '*';
"/"                   return '/';
"-"                   return '-';
"+"                   return '+';
"%"                   return '%';
"^"                   return '^';
"("                   return '(';
")"                   return ')';
","                   return ',';
<<EOF>>               return 'EOF';

/lex

/* operator associations and precedence */

%left '+' '-'
%left '*' '/' '%'
%left '^'
%left UMINUS

%start equation

%% /* language grammar */


equation
    : expr EOF { return $1; }
    ;

expr
    : expr '+' expr { $$ = {
		fn: function(x, y) { return x + y; },
		args: [$1, $3],
		loc: yy.toLoc(@0)
	}; }
    | expr '-' expr { $$ = {
		fn: function(x, y) { return x - y; },
		args: [$1, $3],
		loc: yy.toLoc(@0)
	}; }
    | expr '*' expr { $$ = {
		fn: function(x, y) { return x * y; },
		args: [$1, $3],
		loc: yy.toLoc(@0)
	}; }
    | expr '/' expr { $$ = {
		fn: function(x, y) { return x / y; },
		args: [$1, $3],
		loc: yy.toLoc(@0)
	}; }
    | expr '%' expr { $$ = {
		fn: function(x, y) { return x % y; },
		args: [$1, $3],
		loc: yy.toLoc(@0)
	}; }
    | expr '^' expr { $$ = {
		fn: function(x, y) { return Math.pow(x, y); },
		args: [$1, $3],
		loc: yy.toLoc(@0)
	}; }
    | '-' expr %prec UMINUS { $$ = {
		fn: function(x) { return -x; },
		args: [$1, $3],
		loc: yy.toLoc(@0)
	}; }
    | '(' expr ')' { $$ = $2; }
    | NUMBER { $$ = {
		fn: function(x) { return Number($1); },
		args: [],
		loc: yy.toLoc(@0)
	}; }
    | IDENTIFIER {
		throw new Error('Variables not supported');
    }
    | IDENTIFIER '(' arguments ')' {
		throw new Error('Functions not supported');
    }
    ;

arguments
    : { $$ = []; }
    | expr { $$ = [$1]; }
    | arguments ',' expr { $$ = $1.slice(); $$.push($3); }
    ;
