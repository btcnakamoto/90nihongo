<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:255', 'unique:users'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'japanese_level' => ['required', 'string', 'in:N5,N4,N3,N2,N1'],
        ];
    }

    /**
     * 获取验证错误的自定义消息
     */
    public function messages(): array
    {
        return [
            'username.required' => '用户名不能为空',
            'username.unique' => '该用户名已被使用',
            'email.required' => '邮箱不能为空',
            'email.email' => '请输入有效的邮箱地址',
            'email.unique' => '该邮箱已被注册',
            'password.required' => '密码不能为空',
            'password.min' => '密码至少需要8个字符',
            'password.confirmed' => '两次输入的密码不一致',
            'japanese_level.required' => '请选择日语水平',
            'japanese_level.in' => '请选择有效的日语水平',
        ];
    }
} 