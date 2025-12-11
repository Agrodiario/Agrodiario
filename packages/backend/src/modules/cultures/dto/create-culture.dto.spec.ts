import { validate } from 'class-validator';
import { CreateCultureDto } from './create-culture.dto';
import { CultureOrigin } from '../enums/culture-origin.enum';

describe('CreateCultureDto', () => {
  describe('propertyId', () => {
    it('deve validar com sucesso quando propertyId é um UUID v4 válido', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde'; // UUID v4
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve falhar quando propertyId está vazio', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = '';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const propertyIdError = errors.find((e) => e.property === 'propertyId');
      expect(propertyIdError).toBeDefined();
      expect(propertyIdError?.constraints?.isNotEmpty).toBe('Propriedade associada é obrigatória');
    });

    it('deve falhar quando propertyId é undefined', async () => {
      // Arrange
      const dto = new CreateCultureDto();

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const propertyIdError = errors.find((e) => e.property === 'propertyId');
      expect(propertyIdError).toBeDefined();
      expect(propertyIdError?.constraints?.isNotEmpty).toBe('Propriedade associada é obrigatória');
    });

    it('deve falhar quando propertyId não é um UUID válido', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'nao-e-uuid';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const propertyIdError = errors.find((e) => e.property === 'propertyId');
      expect(propertyIdError).toBeDefined();
      expect(propertyIdError?.constraints?.isUuid).toBe('ID da propriedade inválido');
    });

    it('deve falhar quando propertyId é um número', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 12345 as any;
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const propertyIdError = errors.find((e) => e.property === 'propertyId');
      expect(propertyIdError).toBeDefined();
      expect(propertyIdError?.constraints?.isUuid).toBe('ID da propriedade inválido');
    });
  });

  describe('cycle', () => {
    it('deve validar com sucesso quando cycle é um número inteiro positivo', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve falhar quando cycle está vazio', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = null as any;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const cycleError = errors.find((e) => e.property === 'cycle');
      expect(cycleError).toBeDefined();
      expect(cycleError?.constraints?.isNotEmpty).toBe('Ciclo da cultura é obrigatório');
    });

    it('deve falhar quando cycle é undefined', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const cycleError = errors.find((e) => e.property === 'cycle');
      expect(cycleError).toBeDefined();
      expect(cycleError?.constraints?.isNotEmpty).toBe('Ciclo da cultura é obrigatório');
    });

    it('deve falhar quando cycle não é um inteiro', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120.5;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const cycleError = errors.find((e) => e.property === 'cycle');
      expect(cycleError).toBeDefined();
      expect(cycleError?.constraints?.isInt).toBe('Ciclo deve ser um número inteiro');
    });

    it('deve falhar quando cycle é zero', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 0;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const cycleError = errors.find((e) => e.property === 'cycle');
      expect(cycleError).toBeDefined();
      expect(cycleError?.constraints?.min).toBe('Ciclo deve ser maior que zero');
    });

    it('deve falhar quando cycle é negativo', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = -10;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const cycleError = errors.find((e) => e.property === 'cycle');
      expect(cycleError).toBeDefined();
      expect(cycleError?.constraints?.min).toBe('Ciclo deve ser maior que zero');
    });

    it('deve falhar quando cycle é uma string', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = '120' as any;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const cycleError = errors.find((e) => e.property === 'cycle');
      expect(cycleError).toBeDefined();
      expect(cycleError?.constraints?.isInt).toBe('Ciclo deve ser um número inteiro');
    });
  });

  describe('origin', () => {
    it('deve validar com sucesso quando origin é ORGANIC', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve validar com sucesso quando origin é CONVENTIONAL', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.CONVENTIONAL;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve validar com sucesso quando origin é TRANSGENIC', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.TRANSGENIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve falhar quando origin está vazio', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = null as any;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const originError = errors.find((e) => e.property === 'origin');
      expect(originError).toBeDefined();
      expect(originError?.constraints?.isNotEmpty).toBe('Origem da cultura é obrigatória');
    });

    it('deve falhar quando origin é undefined', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const originError = errors.find((e) => e.property === 'origin');
      expect(originError).toBeDefined();
      expect(originError?.constraints?.isNotEmpty).toBe('Origem da cultura é obrigatória');
    });

    it('deve falhar quando origin tem valor inválido', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = 'invalido' as any;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const originError = errors.find((e) => e.property === 'origin');
      expect(originError).toBeDefined();
      expect(originError?.constraints?.isEnum).toBe(
        'Origem deve ser organic, conventional ou transgenic',
      );
    });

    it('deve falhar quando origin é um número', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = 123 as any;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const originError = errors.find((e) => e.property === 'origin');
      expect(originError).toBeDefined();
      expect(originError?.constraints?.isEnum).toBe(
        'Origem deve ser organic, conventional ou transgenic',
      );
    });
  });

  describe('supplier', () => {
    it('deve validar com sucesso quando supplier é uma string válida', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve validar com sucesso quando supplier está vazio (campo opcional)', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = '';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      const supplierError = errors.find((e) => e.property === 'supplier');
      expect(supplierError).toBeUndefined();
    });

    it('deve validar com sucesso quando supplier é undefined (campo opcional)', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      const supplierError = errors.find((e) => e.property === 'supplier');
      expect(supplierError).toBeUndefined();
    });

    it('deve validar com sucesso quando supplier é null (campo opcional)', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = null as any;
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      const supplierError = errors.find((e) => e.property === 'supplier');
      expect(supplierError).toBeUndefined();
    });

    it('deve falhar quando supplier não é uma string', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 12345 as any;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const supplierError = errors.find((e) => e.property === 'supplier');
      expect(supplierError).toBeDefined();
      expect(supplierError?.constraints?.isString).toBe('Fornecedor deve ser um texto');
    });

    it('deve falhar quando supplier excede 255 caracteres', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'A'.repeat(256); // 256 caracteres

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const supplierError = errors.find((e) => e.property === 'supplier');
      expect(supplierError).toBeDefined();
      expect(supplierError?.constraints?.maxLength).toBe(
        'Fornecedor deve ter no máximo 255 caracteres',
      );
    });

    it('deve validar com sucesso quando supplier tem exatamente 255 caracteres', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'A'.repeat(255); // 255 caracteres
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve validar com sucesso quando supplier tem caracteres especiais', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes & Cia. - São Paulo/SP';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });
  });

  describe('plantingDate', () => {
    it('deve validar com sucesso quando plantingDate está no formato ISO (YYYY-MM-DD)', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve validar com sucesso quando plantingDate está no formato ISO com timestamp', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12T00:00:00.000Z';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve falhar quando plantingDate está vazio', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const plantingDateError = errors.find((e) => e.property === 'plantingDate');
      expect(plantingDateError).toBeDefined();
      expect(plantingDateError?.constraints?.isNotEmpty).toBe('Data de plantio é obrigatória');
    });

    it('deve falhar quando plantingDate é undefined', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const plantingDateError = errors.find((e) => e.property === 'plantingDate');
      expect(plantingDateError).toBeDefined();
      expect(plantingDateError?.constraints?.isNotEmpty).toBe('Data de plantio é obrigatória');
    });

    it('deve falhar quando plantingDate é null', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = null as any;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const plantingDateError = errors.find((e) => e.property === 'plantingDate');
      expect(plantingDateError).toBeDefined();
      expect(plantingDateError?.constraints?.isNotEmpty).toBe('Data de plantio é obrigatória');
    });

    it('deve aceitar plantingDate em formato DD/MM/YYYY (validação apenas de string)', async () => {
      // Arrange - DTO usa @IsString, não @IsDateString, então qualquer string é válida
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.plantingDate = '12/07/2025';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert - passa porque DTO usa @IsString, não @IsDateString
      const plantingDateError = errors.find((e) => e.property === 'plantingDate');
      expect(plantingDateError).toBeUndefined();
    });

    it('deve aceitar qualquer string como plantingDate (validação apenas de string)', async () => {
      // Arrange - DTO usa @IsString, não @IsDateString
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.plantingDate = 'data-invalida';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert - passa porque DTO usa @IsString, não @IsDateString
      const plantingDateError = errors.find((e) => e.property === 'plantingDate');
      expect(plantingDateError).toBeUndefined();
    });

    it('deve falhar quando plantingDate é um número', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.plantingDate = 20250712 as any;
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const plantingDateError = errors.find((e) => e.property === 'plantingDate');
      expect(plantingDateError).toBeDefined();
      expect(plantingDateError?.constraints?.isString).toBe('Data de plantio deve ser uma string');
    });

    it('deve validar com sucesso data no passado', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2024-01-15';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve validar com sucesso data no futuro', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2026-12-31';
      dto.plantingArea = 25.5;
      dto.observations = 'Teste';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });
  });

  describe('plantingArea', () => {
    it('deve validar com sucesso quando plantingArea é um número inteiro positivo', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 50;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve validar com sucesso quando plantingArea é um número decimal', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.75;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve falhar quando plantingArea está vazio', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = null as any;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const plantingAreaError = errors.find((e) => e.property === 'plantingArea');
      expect(plantingAreaError).toBeDefined();
      expect(plantingAreaError?.constraints?.isNotEmpty).toBe('Área de plantio é obrigatória');
    });

    it('deve falhar quando plantingArea é undefined', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const plantingAreaError = errors.find((e) => e.property === 'plantingArea');
      expect(plantingAreaError).toBeDefined();
      expect(plantingAreaError?.constraints?.isNotEmpty).toBe('Área de plantio é obrigatória');
    });

    it('deve falhar quando plantingArea é zero', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 0;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const plantingAreaError = errors.find((e) => e.property === 'plantingArea');
      expect(plantingAreaError).toBeDefined();
      expect(plantingAreaError?.constraints?.isPositive).toBe(
        'Área de plantio deve ser maior que zero',
      );
    });

    it('deve falhar quando plantingArea é negativo', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = -10.5;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const plantingAreaError = errors.find((e) => e.property === 'plantingArea');
      expect(plantingAreaError).toBeDefined();
      expect(plantingAreaError?.constraints?.isPositive).toBe(
        'Área de plantio deve ser maior que zero',
      );
    });

    it('deve falhar quando plantingArea não é um número', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 'vinte' as any;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const plantingAreaError = errors.find((e) => e.property === 'plantingArea');
      expect(plantingAreaError).toBeDefined();
      expect(plantingAreaError?.constraints?.isNumber).toBe('Área de plantio deve ser um número');
    });
  });

  describe('observations', () => {
    it('deve validar com sucesso quando observations é fornecido', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'Plantio realizado em condições ideais';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve validar com sucesso quando observations é undefined (campo opcional)', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve validar com sucesso quando observations é vazio', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = '';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve validar com sucesso quando observations tem texto longo', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 'A'.repeat(1000);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve falhar quando observations não é uma string', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;
      dto.observations = 12345 as any;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const observationsError = errors.find((e) => e.property === 'observations');
      expect(observationsError).toBeDefined();
      expect(observationsError?.constraints?.isString).toBe('Observações devem ser um texto');
    });
  });

  describe('cultureName', () => {
    it('deve validar com sucesso quando cultureName é uma string válida', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate Cereja';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve falhar quando cultureName está vazio', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = '';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const cultureNameError = errors.find((e) => e.property === 'cultureName');
      expect(cultureNameError).toBeDefined();
      expect(cultureNameError?.constraints?.isNotEmpty).toBe('Nome da cultura é obrigatório');
    });

    it('deve falhar quando cultureName não está presente', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const cultureNameError = errors.find((e) => e.property === 'cultureName');
      expect(cultureNameError).toBeDefined();
    });

    it('deve falhar quando cultureName não é uma string', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      (dto as any).cultureName = 123;
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const cultureNameError = errors.find((e) => e.property === 'cultureName');
      expect(cultureNameError).toBeDefined();
      expect(cultureNameError?.constraints?.isString).toBe('Nome da cultura deve ser um texto');
    });

    it('deve falhar quando cultureName excede 255 caracteres', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'a'.repeat(256);
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const cultureNameError = errors.find((e) => e.property === 'cultureName');
      expect(cultureNameError).toBeDefined();
      expect(cultureNameError?.constraints?.maxLength).toBe(
        'Nome da cultura deve ter no máximo 255 caracteres',
      );
    });

    it('deve validar com sucesso quando cultureName contém caracteres especiais', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Milho Verde - Variedade Especial (Orgânico)';
      dto.cultivar = 'AG 1051';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });
  });

  describe('cultivar', () => {
    it('deve validar com sucesso quando cultivar é uma string válida', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'Sweet 100';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });

    it('deve validar com sucesso quando cultivar está vazio (campo opcional)', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = '';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      const cultivarError = errors.find((e) => e.property === 'cultivar');
      expect(cultivarError).toBeUndefined();
    });

    it('deve validar com sucesso quando cultivar não está presente (campo opcional)', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      const cultivarError = errors.find((e) => e.property === 'cultivar');
      expect(cultivarError).toBeUndefined();
    });

    it('deve falhar quando cultivar não é uma string', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      (dto as any).cultivar = 123;
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const cultivarError = errors.find((e) => e.property === 'cultivar');
      expect(cultivarError).toBeDefined();
      expect(cultivarError?.constraints?.isString).toBe('Cultivar/Variedade deve ser um texto');
    });

    it('deve falhar quando cultivar excede 255 caracteres', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Tomate';
      dto.cultivar = 'a'.repeat(256);
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const cultivarError = errors.find((e) => e.property === 'cultivar');
      expect(cultivarError).toBeDefined();
      expect(cultivarError?.constraints?.maxLength).toBe(
        'Cultivar/Variedade deve ter no máximo 255 caracteres',
      );
    });

    it('deve validar com sucesso quando cultivar contém números e caracteres especiais', async () => {
      // Arrange
      const dto = new CreateCultureDto();
      dto.propertyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
      dto.cultureName = 'Milho';
      dto.cultivar = 'AG 1051 - Híbrido';
      dto.cycle = 120;
      dto.origin = CultureOrigin.ORGANIC;
      dto.supplier = 'Sementes Brasil Ltda';
      dto.plantingDate = '2025-07-12';
      dto.plantingArea = 25.5;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBe(0);
    });
  });
});
