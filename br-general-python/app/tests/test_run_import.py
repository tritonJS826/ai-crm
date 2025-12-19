def test_run_module_imports():
    """
    Simply importing app.run should not raise errors.
    Covers lines 1–10 in app/run.py.
    """
    import importlib

    mod = importlib.import_module("app.run")
    assert hasattr(mod, "__name__")
