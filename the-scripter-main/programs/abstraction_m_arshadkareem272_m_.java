abstract class test {
    void non_abstractMethod() {
        System.out.println("Regular method");
    }
    abstract void abstractMethod();
}
class child extends test {
    void abstractMethod() {
        System.out.println("Abstract Method");
    }
}
class abstraction {
    public static void main(String[] args) {
        child obj = new child() ;
        obj.abstractMethod();
        obj.non_abstractMethod();
    }
}