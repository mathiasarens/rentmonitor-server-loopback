export class FinTsAccountTransaction {
  constructor(
    public rawstring: string,
    public date?: Date,
    public name?: string,
    public iban?: string,
    public bic?: string,
    public text?: string,
    public value?: number,
  ) {}
}
