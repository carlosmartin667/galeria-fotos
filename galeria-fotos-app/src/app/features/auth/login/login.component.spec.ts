import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let routeParams: Record<string, string>;
  let isAdmin: boolean;
  let login: ReturnType<typeof vi.fn>;
  let navigateByUrl: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    routeParams = {};
    isAdmin = false;
    login = vi.fn(() => of({ token: 'token' }));
    navigateByUrl = vi.fn();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => routeParams[key] ?? null
              }
            }
          }
        },
        {
          provide: Router,
          useValue: {
            navigateByUrl,
            navigate: vi.fn()
          }
        },
        {
          provide: AuthService,
          useValue: {
            login,
            enterGuestMode: vi.fn()
          }
        },
        {
          provide: SessionService,
          useValue: {
            get isAdmin(): boolean {
              return isAdmin;
            }
          }
        }
      ]
    }).compileComponents();
  });

  it('redirects to a safe admin returnUrl after login', () => {
    routeParams = { returnUrl: '/admin/dashboard' };
    fixture = createFixture();

    submitValidForm();

    expect(navigateByUrl).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('redirects Admin users to admin dashboard when there is no returnUrl', () => {
    isAdmin = true;
    fixture = createFixture();

    submitValidForm();

    expect(navigateByUrl).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('redirects non Admin users to dashboard when there is no returnUrl', () => {
    fixture = createFixture();

    submitValidForm();

    expect(navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('ignores login returnUrl to avoid redirect loops', () => {
    routeParams = { returnUrl: '/login?returnUrl=%2Fadmin%2Fdashboard' };
    isAdmin = true;
    fixture = createFixture();

    submitValidForm();

    expect(navigateByUrl).toHaveBeenCalledWith('/admin/dashboard');
  });

  function createFixture(): ComponentFixture<LoginComponent> {
    const componentFixture = TestBed.createComponent(LoginComponent);
    componentFixture.detectChanges();
    return componentFixture;
  }

  function submitValidForm(): void {
    fixture.componentInstance.form.setValue({
      email: 'admin@example.com',
      password: '12345678'
    });
    fixture.componentInstance.submit();
    fixture.detectChanges();
  }
});
