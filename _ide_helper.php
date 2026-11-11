<?php
/**
 * ============================================================================
 * Laravel IDE Helper Stubs (_ide_helper.php)
 * Provides type definitions for PHP Intelephense & PHP Tools when the Composer
 * vendor/ directory is not installed locally. This file is for IDE static
 * analysis only and is never executed at runtime.
 * ============================================================================
 */

namespace Illuminate\Database\Eloquent\Factories {
    trait HasFactory
    {
        public static function factory(...$parameters) {}
    }
}

namespace Illuminate\Database\Eloquent {
    class Builder
    {
        public function where($column, $operator = null, $value = null) { return $this; }
        public function whereIn($column, $values) { return $this; }
        public function whereBetween($column, array $values) { return $this; }
        public function whereYear($column, $operator, $value = null) { return $this; }
        public function whereMonth($column, $operator, $value = null) { return $this; }
        public function with($relations) { return $this; }
        public function latest($column = 'created_at') { return $this; }
        public function orderBy($column, $direction = 'asc') { return $this; }
        public function get($columns = ['*']) { return new Collection(); }
        public function first($columns = ['*']) { return null; }
        public function firstOrFail($columns = ['*']) { return new static(); }
        public function find($id, $columns = ['*']) { return null; }
        public function findOrFail($id, $columns = ['*']) { return new static(); }
        public function exists(): bool { return false; }
        public function count($columns = '*'): int { return 0; }
        public function sum($column) { return 0; }
        public function pluck($column, $key = null) { return new Collection(); }
        public function delete() { return true; }
    }

    class Collection implements \IteratorAggregate, \Countable
    {
        public function count(): int { return 0; }
        public function sum($callback = null) { return 0; }
        public function filter(?callable $callback = null) { return $this; }
        public function where($key, $operator = null, $value = null) { return $this; }
        public function pluck($value, $key = null) { return $this; }
        public function toArray(): array { return []; }
        public function getIterator(): \Traversable { return new \ArrayIterator([]); }
    }

    abstract class Model
    {
        public $id;
        protected $fillable = [];
        protected $hidden = [];
        protected $casts = [];

        public function belongsTo($related, $foreignKey = null, $ownerKey = null, $relation = null) { return new Builder(); }
        public function hasMany($related, $foreignKey = null, $localKey = null) { return new Builder(); }
        public function hasOne($related, $foreignKey = null, $localKey = null) { return new Builder(); }
        public function update(array $attributes = [], array $options = []): bool { return true; }
        public function save(array $options = []): bool { return true; }
        public function delete(): ?bool { return true; }

        public static function query(): Builder { return new Builder(); }
        public static function where($column, $operator = null, $value = null): Builder { return new Builder(); }
        public static function whereIn($column, $values): Builder { return new Builder(); }
        public static function with($relations): Builder { return new Builder(); }
        public static function all($columns = ['*']): Collection { return new Collection(); }
        public static function find($id, $columns = ['*']) { return new static(); }
        public static function findOrFail($id, $columns = ['*']) { return new static(); }
        public static function create(array $attributes = []) { return new static(); }
        public static function firstOrCreate(array $attributes = [], array $values = []) { return new static(); }
        public static function updateOrCreate(array $attributes, array $values = []) { return new static(); }
        public static function count($columns = '*'): int { return 0; }
    }
}

namespace Illuminate\Foundation\Auth {
    use Illuminate\Database\Eloquent\Model;

    class User extends Model {}
}

namespace Illuminate\Notifications {
    trait Notifiable {}
}

namespace Illuminate\Http {
    class UploadedFile
    {
        public function store(string $path = '', $options = []): string { return ''; }
        public function getClientOriginalName(): string { return ''; }
        public function getClientOriginalExtension(): string { return ''; }
        public function getSize(): int { return 0; }
    }

    class Request
    {
        public function validate(array $rules, array $messages = [], array $attributes = []): array { return []; }
        public function input(?string $key = null, $default = null) { return $default; }
        public function query(?string $key = null, $default = null) { return $default; }
        public function filled($key): bool { return false; }
        public function boolean($key = null, $default = false): bool { return $default; }
        public function hasFile(string $key): bool { return false; }
        public function file(?string $key = null, $default = null): ?UploadedFile { return new UploadedFile(); }
        public function session() { return new \Illuminate\Session\Store(); }
        public function routeIs(...$patterns): bool { return false; }
        public function only($keys): array { return []; }
        public function all($keys = null): array { return []; }
    }

    class RedirectResponse
    {
        public function with($key, $value = null) { return $this; }
        public function withErrors($provider, $key = 'default') { return $this; }
        public function withInput(?array $input = null) { return $this; }
        public function intended($default = '/', $status = 302, $headers = [], $secure = null) { return $this; }
    }
}

namespace Illuminate\Session {
    class Store
    {
        public function invalidate(): bool { return true; }
        public function regenerate(bool $destroy = false): bool { return true; }
        public function regenerateToken(): void {}
        public function get(string $key, $default = null) { return $default; }
        public function put($key, $value = null): void {}
    }
}

namespace Illuminate\Support {
    class Carbon extends \DateTime
    {
        public static function parse($time = null, $tz = null): self { return new self(); }
        public static function now($tz = null): self { return new self(); }
        public function diffInDays($date = null, $absolute = true): int { return 1; }
        public function diffInSeconds($date = null, $absolute = true): int { return 0; }
        public function addHours(int $value): self { return $this; }
        public function addDays(int $value): self { return $this; }
        public function subHours(int $value): self { return $this; }
        public function isPast(): bool { return false; }
        public function toDateString(): string { return '2026-11-14'; }
    }

    class Str
    {
        public static function slug($title, $separator = '-', $language = 'en'): string { return ''; }
        public static function random($length = 16): string { return ''; }
        public static function upper(string $value): string { return strtoupper($value); }
    }
}

namespace Illuminate\Support\Facades {
    class Auth
    {
        public static function user() { return new \App\Models\User(); }
        public static function id() { return 1; }
        public static function check(): bool { return true; }
        public static function login($user, bool $remember = false): void {}
        public static function logout(): void {}
        public static function attempt(array $credentials = [], bool $remember = false): bool { return true; }
    }

    class Hash
    {
        public static function make(string $value, array $options = []): string { return ''; }
        public static function check(string $value, string $hashedValue, array $options = []): bool { return true; }
    }

    class Schema
    {
        public static function create(string $table, \Closure $callback): void {}
        public static function dropIfExists(string $table): void {}
    }

    class Route
    {
        public static function get(string $uri, $action = null): self { return new self(); }
        public static function post(string $uri, $action = null): self { return new self(); }
        public static function put(string $uri, $action = null): self { return new self(); }
        public static function patch(string $uri, $action = null): self { return new self(); }
        public static function delete(string $uri, $action = null): self { return new self(); }
        public static function middleware($middleware): self { return new self(); }
        public function group(\Closure $callback): self { return $this; }
        public function name(string $name): self { return $this; }
    }
}

namespace Illuminate\Database\Migrations {
    abstract class Migration
    {
        public function up(): void {}
        public function down(): void {}
    }
}

namespace Illuminate\Database\Schema {
    class ColumnDefinition
    {
        public function nullable(bool $value = true): self { return $this; }
        public function unique($indexName = null): self { return $this; }
        public function default($value): self { return $this; }
        public function constrained(?string $table = null, ?string $column = 'id'): self { return $this; }
        public function cascadeOnDelete(): self { return $this; }
        public function nullOnDelete(): self { return $this; }
        public function unsigned(): self { return $this; }
    }

    class Blueprint
    {
        public function id(string $column = 'id'): ColumnDefinition { return new ColumnDefinition(); }
        public function foreignId(string $column): ColumnDefinition { return new ColumnDefinition(); }
        public function string(string $column, ?int $length = null): ColumnDefinition { return new ColumnDefinition(); }
        public function text(string $column): ColumnDefinition { return new ColumnDefinition(); }
        public function integer(string $column): ColumnDefinition { return new ColumnDefinition(); }
        public function unsignedSmallInteger(string $column): ColumnDefinition { return new ColumnDefinition(); }
        public function unsignedTinyInteger(string $column): ColumnDefinition { return new ColumnDefinition(); }
        public function decimal(string $column, int $total = 8, int $places = 2): ColumnDefinition { return new ColumnDefinition(); }
        public function boolean(string $column): ColumnDefinition { return new ColumnDefinition(); }
        public function date(string $column): ColumnDefinition { return new ColumnDefinition(); }
        public function timestamp(string $column, int $precision = 0): ColumnDefinition { return new ColumnDefinition(); }
        public function timestamps(int $precision = 0): void {}
        public function enum(string $column, array $allowed): ColumnDefinition { return new ColumnDefinition(); }
        public function json(string $column): ColumnDefinition { return new ColumnDefinition(); }
        public function rememberToken(): ColumnDefinition { return new ColumnDefinition(); }
        public function unique($columns, ?string $name = null): ColumnDefinition { return new ColumnDefinition(); }
        public function index($columns, ?string $name = null): ColumnDefinition { return new ColumnDefinition(); }
    }
}

namespace Illuminate\Database {
    abstract class Seeder
    {
        public function run(): void {}
        public function call($class, bool $silent = false, array $parameters = []) { return $this; }
    }
}

namespace Symfony\Component\HttpFoundation {
    class StreamedResponse
    {
        public function __construct(?callable $callback = null, int $status = 200, array $headers = []) {}
    }
}

namespace {
    if (!function_exists('asset')) {
        function asset(string $path, ?bool $secure = null): string { return $path; }
    }
    if (!function_exists('route')) {
        function route(string $name, $parameters = [], bool $absolute = true): string { return $name; }
    }
    if (!function_exists('request')) {
        /** @return \Illuminate\Http\Request|mixed */
        function request($key = null, $default = null) { return new \Illuminate\Http\Request(); }
    }
    if (!function_exists('view')) {
        function view(?string $view = null, $data = [], array $mergeData = []) { return $view; }
    }
    if (!function_exists('redirect')) {
        function redirect(?string $to = null, int $status = 302, array $headers = [], ?bool $secure = null): \Illuminate\Http\RedirectResponse {
            return new \Illuminate\Http\RedirectResponse();
        }
    }
    if (!function_exists('back')) {
        function back(int $status = 302, array $headers = [], $fallback = false): \Illuminate\Http\RedirectResponse {
            return new \Illuminate\Http\RedirectResponse();
        }
    }
    if (!function_exists('session')) {
        function session($key = null, $default = null) { return new \Illuminate\Session\Store(); }
    }
    if (!function_exists('auth')) {
        function auth(?string $guard = null) { return new \Illuminate\Support\Facades\Auth(); }
    }
    if (!function_exists('now')) {
        function now($tz = null): \Illuminate\Support\Carbon { return new \Illuminate\Support\Carbon(); }
    }
    if (!function_exists('abort')) {
        function abort(int $code, string $message = '', array $headers = []): void {}
    }
    if (!function_exists('response')) {
        function response($content = '', int $status = 200, array $headers = []) {
            return new class {
                public function json($data = [], int $status = 200, array $headers = [], int $options = 0) { return $this; }
                public function streamDownload(callable $callback, ?string $name = null, array $headers = [], ?string $disposition = 'attachment') { return $this; }
            };
        }
    }
}
