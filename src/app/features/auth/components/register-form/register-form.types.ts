export enum RegisterFormField {
  Email = 'email',
  Name = 'name',
  Password = 'password',
  Avatar = 'avatar',
}

export interface RegisterFormData {
  [RegisterFormField.Email]: string;
  [RegisterFormField.Name]: string;
  [RegisterFormField.Password]: string;
  [RegisterFormField.Avatar]: string;
}

export interface RegisterFormErrors {
  [RegisterFormField.Email]?: string;
  [RegisterFormField.Name]?: string;
  [RegisterFormField.Password]?: string;
  [RegisterFormField.Avatar]?: string;
}
