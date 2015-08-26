describe('Service: authSvc', function () {

	beforeEach(module('com.inthetelling.story'));

	var authSvc;
	beforeEach(inject(function (_authSvc_) {
		authSvc = _authSvc_;
	}));

	it('should return admin from getRoleForNarrative when admin is included with no scoping', function () {
    var roles = [
      {
        role: "instructor"
      },
      {
        role: "admin"
      }
    ];

		var role = authSvc.getRoleForNarrative("1234", roles);
		expect(role).toEqual("admin");
	});

	it('should return instructor from getRoleForNarrative when admin is scoped out', function () {
    var roles = [
      {
        role: "instructor"
      },
      {
        role: "admin",
        resource_id: "1111"
      }
    ];
		var role = authSvc.getRoleForNarrative("1234", roles);
		expect(role).toEqual("instructor");
	});
  it('should return guest from getRoleForNarrative when admin, instructor, and student is scoped out', function () {
    var roles = [
      {
        role: "instructor",
        resource_id: "1111"
      },
      {
        role: "admin",
        resource_id: "1111"
      },
      {
        role: "student",
        resource_id: "1111"
      },
      {
        role: "guest"
      }
    ];
		var role = authSvc.getRoleForNarrative("1234", roles);
		expect(role).toEqual("guest");
	});
  it('should return student from getRoleForNarrative when admin, but others included, is scoped out', function () {
    var roles = [
      {
        role: "instructor",
        resource_id: "1111"
      },
      {
        role: "student"
      },
      {
        role: "guest"
      },
      {
        role: "admin",
        resource_id: "1111"
      }
    ];
		var role = authSvc.getRoleForNarrative("1234", roles);
		expect(role).toEqual("student");
	});
  it('should return instructor from getRoleForNarrative when admin,  is scoped out', function () {
    var roles = [
      {
        role: "instructor",
      },
      {
        role: "admin",
        resource_id: "1111"
      },
      {
        role: "student"
      },
      {
        role: "guest"
      }
    ];
		var role = authSvc.getRoleForNarrative("1234", roles);
		expect(role).toEqual("instructor");
	});
  it('should return admin from getRoleForNarrative when admin, has correct scope', function () {
    var roles = [
      {
        role: "instructor",
      },
      {
        role: "admin",
        resource_id: "1111"
      },
      {
        role: "student"
      },
      {
        role: "guest"
      }
    ];
		var role = authSvc.getRoleForNarrative("1111", roles);
		expect(role).toEqual("admin");
	});

  it('should return empty string when roles array is empty', function () {
    var roles = [];
		var role = authSvc.getRoleForNarrative("1111", roles);
		  expect(role).toEqual("");
	 });
});
