<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;

class Cnpj implements ValidationRule, DataAwareRule
{
    /**
     * @var array<string, mixed>
     */
    protected array $data = [];

    /**
     * Set the data under validation.
     */
    public function setData(array $data): static
    {
        $this->data = $data;

        return $this;
    }

    /**
     * Run the validation rule.
     *
     * @param  Closure(string): void  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $digits = preg_replace('/\D+/', '', (string) $value);

        if (strlen($digits) !== 14) {
            $fail('The :attribute must be a valid CNPJ.');

            return;
        }

        if (preg_match('/^(\d)\1{13}$/', $digits)) {
            $fail('The :attribute must be a valid CNPJ.');

            return;
        }

        $baseDigits = substr($digits, 0, 12);
        $verifiers = substr($digits, -2);

        $calculateVerifier = function (string $base, int $length): int {
            $sum = 0;
            $weight = $length - 7;

            for ($i = 0; $i < $length; $i++) {
                $sum += (int) $base[$i] * $weight;
                $weight--;

                if ($weight < 2) {
                    $weight = 9;
                }
            }

            $mod = $sum % 11;

            return $mod < 2 ? 0 : 11 - $mod;
        };

        $firstVerifier = $calculateVerifier($baseDigits, 12);
        $secondVerifier = $calculateVerifier($baseDigits.$firstVerifier, 13);

        if ($verifiers !== $firstVerifier.$secondVerifier) {
            $fail('The :attribute must be a valid CNPJ.');
        }
    }
}
