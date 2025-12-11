import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { Button } from "../../components/common/Button/Button";
import { Input } from "../../components/common/Input/Input";
import { cpfMask, dateMask, phoneMask } from "../../utils/masks";
import { useAuth } from "../../contexts/AuthContext";
import { validateCpf, isValidDate } from "@/utils/validators";

import logo from "../../assets/logo.png";
import styles from "./Register.module.css";

interface FormData {
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  name?: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    cpf: "",
    birthDate: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = (
    name: keyof FormData,
    value: string,
    currentFormData: FormData,
  ): string => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Nome é obrigatório";
        if (value.trim().length < 3)
          return "Nome deve ter pelo menos 3 caracteres";
        return "";

      case "cpf":
        const cleanCpf = value.replace(/[^\d]/g, "");
        if (!cleanCpf) return "CPF é obrigatório";
        if (cleanCpf.length < 11) return "CPF incompleto";
        if (!validateCpf(cleanCpf)) return "CPF inválido";
        return "";

      case "birthDate":
        if (!value) return "Data de nascimento é obrigatória";
        if (value.length < 10) return "Data incompleta (DD/MM/AAAA)";

        if (!isValidDate(value))
          return "Data inválida. Verifique o dia e o mês.";

        // Verificação de idade
        const dateParts = value.split("/").map(Number);
        const [day, month, year] = dateParts;
        const birthDate = new Date(year, month - 1, day);

        const ageInYears = new Date().getFullYear() - birthDate.getFullYear();
        const hasHadBirthday =
          new Date().getMonth() > birthDate.getMonth() ||
          (new Date().getMonth() === birthDate.getMonth() &&
            new Date().getDate() >= birthDate.getDate());

        const age = hasHadBirthday ? ageInYears : ageInYears - 1;

        if (age < 18) {
          return "Você deve ter pelo menos 18 anos";
        }

        return "";

      case "phone":
        const cleanPhone = value.replace(/[^\d]/g, "");
        if (!cleanPhone) return "Telefone é obrigatório";
        if (cleanPhone.length < 10) return "Telefone incompleto (DDD + número)";
        return "";

      case "email":
        if (!value) return "E-mail é obrigatório";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "E-mail inválido";
        return "";

      case "password":
        if (!value) return "Senha é obrigatória";
        if (value.length < 8) return "Senha deve ter pelo menos 8 caracteres";
        return "";

      case "confirmPassword":
        if (!value) return "Confirmação de senha é obrigatória";
        if (value !== currentFormData.password) return "As senhas não conferem";
        return "";

      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      name: validateField("name", formData.name, formData),
      cpf: validateField("cpf", formData.cpf, formData),
      birthDate: validateField("birthDate", formData.birthDate, formData),
      phone: validateField("phone", formData.phone, formData),
      email: validateField("email", formData.email, formData),
      password: validateField("password", formData.password, formData),
      confirmPassword: validateField(
        "confirmPassword",
        formData.confirmPassword,
        formData,
      ),
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleBlur = (field: keyof FormData) => {
    const error = validateField(field, formData[field], formData);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormData;

    let maskedValue = value;
    switch (fieldName) {
      case "cpf":
        maskedValue = cpfMask(value);
        break;
      case "birthDate":
        maskedValue = dateMask(value);
        break;
      case "phone":
        maskedValue = phoneMask(value);
        break;
    }

    setFormData((prev) => {
      const updatedFormData = { ...prev, [fieldName]: maskedValue };

      // Revalida o campo
      const error = validateField(fieldName, maskedValue, updatedFormData);

      // Revalidação especial da confirmação de senha
      let confirmPasswordError = errors.confirmPassword;
      if (fieldName === "password") {
        confirmPasswordError = validateField(
          "confirmPassword",
          updatedFormData.confirmPassword,
          updatedFormData,
        );
      }

      setErrors((prevErrors) => ({
        ...prevErrors,
        [fieldName]: error,
        confirmPassword: confirmPasswordError,
        general: errors.general ? "" : errors.general, // Limpa erro geral na interação
      }));

      return updatedFormData;
    });
  };

  // Botão desabilitado se houver erros nos campos ou se estiver carregando, ou se algum campo estiver vazio
  const isButtonDisabled =
    Object.values(errors).some((error) => !!error) ||
    isLoading ||
    Object.values(formData).some((val) => !val.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Converte data do formato DD/MM/YYYY para ISO (YYYY-MM-DD)
      const [day, month, year] = formData.birthDate.split("/");
      const isoBirthDate = `${year}-${month}-${day}`;

      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        cpf: formData.cpf,
        phone: formData.phone,
        birthDate: isoBirthDate,
      });

      navigate("/app");
    } catch (err: any) {
      console.error("Erro no registro:", err);

      let generalError: string = "Erro ao criar conta. Tente novamente.";
      let apiMessage: string = "";

      // Tenta extrair a mensagem de erro do NestJS/Axios (status 409 Conflict)
      if (err.response && err.response.data && err.response.data.message) {
        apiMessage = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message;
      } else {
        apiMessage = err.message || generalError;
      }

      // Mapeamento das mensagens específicas do back-end
      if (apiMessage.includes("Email já registrado")) {
        generalError = "O e-mail informado já está cadastrado.";
      } else if (apiMessage.includes("CPF já registrado")) {
        generalError = "O CPF informado já está cadastrado.";
      } else {
        generalError = apiMessage;
      }

      setErrors({ general: generalError });
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerCard}>
        <img src={logo} alt="AgroDiário Logo" className={styles.logo} />
        <h2 className={styles.title}>Crie sua conta</h2>
        <p className={styles.subtitle}>
          Já tem uma conta?{" "}
          <Link to="/login" className={styles.link}>
            Entre agora.
          </Link>
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.general && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fed7d7", // Cor de erro
                color: "#c53030", // Cor do texto
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px",
                border: "1px solid #feb2b2",
              }}
            >
              {errors.general}
            </div>
          )}

          {/* Nome */}
          <Input
            label="Seu nome completo"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => handleBlur("name")}
            placeholder="Ex: Maria da Silva"
            required
            error={errors.name}
            showError={!!errors.name}
          />

          {/* CPF */}
          <Input
            label="CPF"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            onBlur={() => handleBlur("cpf")}
            placeholder="000.000.000-00"
            maxLength={14}
            required
            error={errors.cpf}
            showError={!!errors.cpf}
          />

          {/* Data de nascimento */}
          <Input
            label="Data de nascimento"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            onBlur={() => handleBlur("birthDate")}
            placeholder="DD/MM/AAAA"
            maxLength={10}
            required
            error={errors.birthDate}
            showError={!!errors.birthDate}
          />

          {/* Telefone */}
          <Input
            label="Seu número de telefone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={() => handleBlur("phone")}
            placeholder="(00) 00000-0000"
            maxLength={15}
            required
            error={errors.phone}
            showError={!!errors.phone}
          />

          {/* E-mail */}
          <Input
            label="Seu e-mail"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur("email")}
            placeholder="Ex: maria.silva@email.com"
            required
            error={errors.email}
            showError={!!errors.email}
          />

          {/* Senha */}
          <Input
            label="Sua senha"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            onBlur={() => handleBlur("password")}
            placeholder="Mínimo 8 caracteres"
            required
            icon={showPassword ? <FaEyeSlash /> : <FaEye />}
            onIconClick={() => setShowPassword(!showPassword)}
            error={errors.password}
            showError={!!errors.password}
          />

          {/* Confirma Senha */}
          <Input
            label="Confirme sua senha"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={() => handleBlur("confirmPassword")}
            placeholder="Repita sua senha"
            required
            icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            onIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword}
            showError={!!errors.confirmPassword}
          />

          <Button type="submit" disabled={isButtonDisabled}>
            {isLoading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
      </div>
    </div>
  );
}
